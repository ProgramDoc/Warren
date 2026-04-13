import { getPlaidClient } from "./client";
import { mapPlaidCategory } from "./categories";
import { decrypt } from "@/lib/crypto";
import {
  getPlaidItem,
  updatePlaidItemCursor,
  updatePlaidItemStatus,
  upsertAccountBalance,
  replaceInvestmentHoldings,
  createPlaidExpense,
  updatePlaidExpense,
  removePlaidExpense,
} from "@/lib/db";
import type { RemovedTransaction } from "plaid";

export interface SyncResult {
  added: number;
  modified: number;
  removed: number;
}

export async function syncTransactions(itemId: number): Promise<SyncResult> {
  const item = await getPlaidItem(itemId);
  if (!item || item.status !== "active") {
    throw new Error(`Plaid item ${itemId} not found or not active`);
  }

  const plaid = getPlaidClient();
  const accessToken = decrypt(item.access_token);
  let cursor = item.cursor || undefined;
  let added = 0;
  let modified = 0;
  let removed = 0;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await plaid.transactionsSync({
        access_token: accessToken,
        cursor,
      });

      const data = response.data;

      // Process added transactions
      for (const txn of data.added) {
        if (txn.amount <= 0) continue; // Skip income/credits for now (negative amounts in Plaid)

        const pfc = txn.personal_finance_category;
        const { category, personalOrBusiness } = mapPlaidCategory(
          pfc?.primary,
          pfc?.detailed,
          txn.merchant_name
        );

        await createPlaidExpense(
          txn.date,
          txn.merchant_name || txn.name,
          Math.abs(txn.amount), // Plaid uses positive for debits
          category,
          personalOrBusiness,
          txn.transaction_id,
          itemId,
          item.connected_by
        );
        added++;
      }

      // Process modified transactions
      for (const txn of data.modified) {
        const pfc = txn.personal_finance_category;
        const { category, personalOrBusiness } = mapPlaidCategory(
          pfc?.primary,
          pfc?.detailed,
          txn.merchant_name
        );

        await updatePlaidExpense(
          txn.transaction_id,
          txn.date,
          txn.merchant_name || txn.name,
          Math.abs(txn.amount),
          category,
          personalOrBusiness
        );
        modified++;
      }

      // Process removed transactions
      for (const txn of data.removed as RemovedTransaction[]) {
        if (txn.transaction_id) {
          await removePlaidExpense(txn.transaction_id);
          removed++;
        }
      }

      cursor = data.next_cursor;
      hasMore = data.has_more;
    }

    // Save cursor for next incremental sync
    if (cursor) {
      await updatePlaidItemCursor(itemId, cursor);
    }

    await updatePlaidItemStatus(itemId, "active");
    return { added, modified, removed };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    await updatePlaidItemStatus(itemId, "error", errMsg.slice(0, 200));
    throw error;
  }
}

export async function syncBalances(itemId: number): Promise<number> {
  const item = await getPlaidItem(itemId);
  if (!item || item.status === "disconnected") {
    throw new Error(`Plaid item ${itemId} not found or disconnected`);
  }

  const plaid = getPlaidClient();
  const accessToken = decrypt(item.access_token);

  const response = await plaid.accountsBalanceGet({
    access_token: accessToken,
  });

  for (const account of response.data.accounts) {
    await upsertAccountBalance(
      itemId,
      account.account_id,
      account.name,
      account.official_name || null,
      account.type,
      account.subtype || null,
      account.mask || null,
      account.balances.current ?? null,
      account.balances.available ?? null,
      account.balances.iso_currency_code || "USD"
    );
  }

  return response.data.accounts.length;
}

export async function syncInvestments(itemId: number): Promise<number> {
  const item = await getPlaidItem(itemId);
  if (!item || item.status === "disconnected") {
    throw new Error(`Plaid item ${itemId} not found or disconnected`);
  }

  if (!item.products.includes("investments")) {
    return 0;
  }

  const plaid = getPlaidClient();
  const accessToken = decrypt(item.access_token);

  const response = await plaid.investmentsHoldingsGet({
    access_token: accessToken,
  });

  const securities = new Map(
    response.data.securities.map((s) => [s.security_id, s])
  );

  const holdings = response.data.holdings.map((h) => {
    const sec = securities.get(h.security_id);
    return {
      accountId: h.account_id,
      securityId: h.security_id,
      ticker: sec?.ticker_symbol || null,
      name: sec?.name || "Unknown Security",
      quantity: h.quantity,
      price: h.institution_price,
      value: h.institution_value,
      costBasis: h.cost_basis ?? null,
      type: sec?.type || null,
    };
  });

  return replaceInvestmentHoldings(itemId, holdings);
}
