import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getPlaidClient } from "@/lib/plaid/client";
import { encrypt } from "@/lib/crypto";
import { createPlaidItem, logAudit } from "@/lib/db";
import { syncTransactions, syncBalances, syncInvestments } from "@/lib/plaid/sync";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { public_token, institution, products } = await req.json();

    if (!public_token) {
      return NextResponse.json({ error: "Missing public_token" }, { status: 400 });
    }

    const plaid = getPlaidClient();

    // Exchange public token for access token
    const exchangeResponse = await plaid.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Encrypt the access token before storing
    const encryptedToken = encrypt(accessToken);

    // Store in database
    const item = await createPlaidItem(
      itemId,
      encryptedToken,
      institution?.institution_id || null,
      institution?.name || null,
      products || ["transactions"],
      session.user_id
    );

    await logAudit(
      session.user_id,
      "plaid_connect",
      "plaid",
      `Connected ${institution?.name || "unknown"} (item: ${item.id})`,
      req.headers.get("x-forwarded-for") || undefined
    );

    // Run initial sync
    const syncResults: Record<string, unknown> = {};
    try {
      syncResults.transactions = await syncTransactions(item.id);
      syncResults.balances = await syncBalances(item.id);
      if ((products || []).includes("investments")) {
        syncResults.investments = await syncInvestments(item.id);
      }
    } catch (syncError) {
      syncResults.sync_error = syncError instanceof Error ? syncError.message : String(syncError);
    }

    return NextResponse.json({
      success: true,
      item_id: item.id,
      institution: institution?.name,
      sync_results: syncResults,
    });
  } catch (error) {
    console.error("Plaid exchange error:", error);
    return NextResponse.json(
      { error: "Failed to exchange token", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
