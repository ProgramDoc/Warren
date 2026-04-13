import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getPlaidItems } from "@/lib/db";

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getPlaidItems();

  // Strip encrypted access tokens from response
  const safeItems = items.map(({ access_token: _token, ...rest }) => rest);

  return NextResponse.json({ items: safeItems });
}
