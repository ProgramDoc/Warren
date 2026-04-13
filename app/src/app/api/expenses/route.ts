import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { createExpense, logAudit, query } from "@/lib/db";

const ExpenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  category: z.string().min(1),
  paymentMethod: z.string().optional(),
  personalOrBusiness: z.enum(["personal", "business"]).default("personal"),
  notes: z.string().optional(),
});

// GET: List expenses (with optional date filters)
export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const year = req.nextUrl.searchParams.get("year") || new Date().getFullYear().toString();
  const month = req.nextUrl.searchParams.get("month");

  let sql = "SELECT * FROM expenses WHERE EXTRACT(YEAR FROM date) = $1";
  const params: unknown[] = [parseInt(year)];

  if (month) {
    sql += " AND EXTRACT(MONTH FROM date) = $2";
    params.push(parseInt(month));
  }

  // Household users only see personal expenses
  if (session.role === "household") {
    sql += ` AND personal_or_business = 'personal'`;
  }

  sql += " ORDER BY date DESC, created_at DESC LIMIT 100";

  const expenses = await query(sql, params);
  return NextResponse.json({ expenses });
}

// POST: Create expense
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = ExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { date, description, amount, category, paymentMethod, personalOrBusiness, notes } =
      parsed.data;

    const expense = await createExpense(
      date,
      description,
      amount,
      category,
      paymentMethod || null,
      personalOrBusiness,
      notes || null,
      session.user_id
    );

    await logAudit(
      session.user_id,
      "create_expense",
      "expenses",
      `${description}: $${amount}`,
      req.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
