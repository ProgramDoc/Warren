import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getPlaidItem, disconnectPlaidItem, logAudit } from "@/lib/db";
import { getPlaidClient } from "@/lib/plaid/client";
import { decrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { item_id } = await req.json();
    if (!item_id) {
      return NextResponse.json({ error: "Missing item_id" }, { status: 400 });
    }

    const item = await getPlaidItem(item_id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Remove from Plaid
    try {
      const plaid = getPlaidClient();
      const accessToken = decrypt(item.access_token);
      await plaid.itemRemove({ access_token: accessToken });
    } catch (e) {
      console.error("Plaid item remove error (non-fatal):", e);
    }

    // Mark as disconnected in our DB
    await disconnectPlaidItem(item_id);

    await logAudit(
      session.user_id,
      "plaid_disconnect",
      "plaid",
      `Disconnected ${item.institution_name || "unknown"} (item: ${item_id})`,
      req.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plaid disconnect error:", error);
    return NextResponse.json(
      { error: "Disconnect failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
