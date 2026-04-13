import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getInvestmentHoldings } from "@/lib/db";

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const holdings = await getInvestmentHoldings();
  const totalValue = holdings.reduce(
    (sum, h) => sum + (parseFloat(String(h.value)) || 0),
    0
  );

  return NextResponse.json({ holdings, total_value: totalValue });
}
