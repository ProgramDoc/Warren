import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getAccountBalances } from "@/lib/db";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await getAccountBalances();

  // Group by type
  const grouped: Record<string, typeof accounts> = {};
  for (const account of accounts) {
    const type = account.type || "other";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(account);
  }

  return NextResponse.json({ accounts, grouped });
}
