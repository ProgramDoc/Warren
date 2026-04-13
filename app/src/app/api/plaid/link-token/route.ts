import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getPlaidClient } from "@/lib/plaid/client";
import { CountryCode, Products } from "plaid";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const requestedProducts = (body.products as string[]) || ["transactions"];

    const productMap: Record<string, Products> = {
      transactions: Products.Transactions,
      investments: Products.Investments,
    };

    const products = requestedProducts
      .filter((p) => productMap[p])
      .map((p) => productMap[p]);

    if (products.length === 0) {
      products.push(Products.Transactions);
    }

    const plaid = getPlaidClient();
    const response = await plaid.linkTokenCreate({
      user: { client_user_id: session.user_id },
      client_name: "Warren Financial Advisor",
      products,
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error("Plaid link token error:", error);
    return NextResponse.json(
      { error: "Failed to create link token", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
