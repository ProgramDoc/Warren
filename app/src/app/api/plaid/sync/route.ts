import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getPlaidItems, getPlaidItem, logAudit } from "@/lib/db";
import { syncTransactions, syncBalances, syncInvestments } from "@/lib/plaid/sync";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetItemId = body.item_id as number | undefined;

    const items = targetItemId
      ? [await getPlaidItem(targetItemId)].filter(Boolean)
      : await getPlaidItems();

    const results = [];

    for (const item of items) {
      if (!item || item.status === "disconnected") continue;

      const result: Record<string, unknown> = {
        item_id: item.id,
        institution: item.institution_name,
      };

      try {
        result.transactions = await syncTransactions(item.id);
        result.balances = await syncBalances(item.id);
        if (item.products.includes("investments")) {
          result.investments = await syncInvestments(item.id);
        }
        result.status = "success";
      } catch (error) {
        result.status = "error";
        result.error = error instanceof Error ? error.message : String(error);
      }

      results.push(result);
    }

    await logAudit(
      session.user_id,
      "plaid_sync",
      "plaid",
      `Synced ${results.length} item(s)`,
      req.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Plaid sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
