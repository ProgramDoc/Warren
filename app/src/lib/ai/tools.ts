import type Anthropic from "@anthropic-ai/sdk";
import {
  getBudgetProgress,
  getIncomeYTD,
  getIncomeByPeriod,
  getTaxDeadlines,
  getRecurringBills,
  getActiveAlerts,
  getExpensesByMonth,
  createExpense,
} from "@/lib/db";

// Tool definitions for Claude
export const warrenTools: Anthropic.Tool[] = [
  {
    name: "get_budget_progress",
    description:
      "Get current month budget progress — spending vs budget by category. Shows how much has been spent in each budget category relative to the monthly target.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "number", description: "Year (defaults to current year)" },
        month: { type: "number", description: "Month 1-12 (defaults to current month)" },
      },
      required: [],
    },
  },
  {
    name: "get_income_summary",
    description:
      "Get year-to-date income summary by source (UCLA, AiTheia, SL W-2) with totals and projections. Owner only.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "number", description: "Year (defaults to current year)" },
      },
      required: [],
    },
  },
  {
    name: "get_expense_breakdown",
    description:
      "Get expense breakdown by category for a given month. Shows total spending per category.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "number", description: "Year" },
        month: { type: "number", description: "Month 1-12" },
      },
      required: [],
    },
  },
  {
    name: "get_tax_deadlines",
    description:
      "Get all upcoming tax deadlines with status (upcoming, paid, not_paid, extension). Owner only.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_tax_position",
    description:
      "Get current tax position — YTD income, estimated tax liability, withholdings to date, and estimated gap. Owner only.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "number", description: "Tax year (defaults to current year)" },
      },
      required: [],
    },
  },
  {
    name: "get_cashflow_projection",
    description:
      "Get monthly cash flow projection — income minus recurring bills, estimated monthly surplus or deficit.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_recurring_bills",
    description:
      "Get all active recurring bills with amounts, frequency, due dates, and auto-pay status.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_alerts",
    description:
      "Get active financial alerts — urgent items, warnings, and informational notices.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "log_expense",
    description:
      "Record a new expense. Use the Chart of Accounts codes: P-HOU (Housing), P-UTL (Utilities), P-TRN (Transportation), P-GRC (Groceries), P-DIN (Dining), P-HLT (Health), P-CHD (Childcare), P-INS (Insurance), P-DEB (Debt), P-TRV (Travel), P-CLO (Clothing), P-MSC (Miscellaneous), B-HOM (Home Office), B-SOF (Software), B-TRV (Business Travel), B-PRO (Professional Dev), B-MSC (Business Misc).",
    input_schema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Date in YYYY-MM-DD format" },
        description: { type: "string", description: "What was purchased" },
        amount: { type: "number", description: "Amount in dollars" },
        category: { type: "string", description: "Chart of Accounts code (e.g., P-GRC)" },
        personal_or_business: {
          type: "string",
          enum: ["personal", "business"],
          description: "Personal or business expense",
        },
        notes: { type: "string", description: "Optional notes" },
      },
      required: ["date", "description", "amount", "category", "personal_or_business"],
    },
  },
];

// Tools restricted to owner role
const OWNER_ONLY_TOOLS = new Set([
  "get_income_summary",
  "get_tax_deadlines",
  "get_tax_position",
]);

// Filter tools based on user role
export function getToolsForRole(role: string): Anthropic.Tool[] {
  if (role === "owner") return warrenTools;
  return warrenTools.filter((t) => !OWNER_ONLY_TOOLS.has(t.name));
}

// Execute a tool call and return the result
export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  role: string,
  userId: string
): Promise<string> {
  // RBAC check
  if (OWNER_ONLY_TOOLS.has(toolName) && role !== "owner") {
    return JSON.stringify({
      error: "This information is restricted to the account owner.",
    });
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  try {
    switch (toolName) {
      case "get_budget_progress": {
        const year = (input.year as number) || currentYear;
        const month = (input.month as number) || currentMonth;
        const data = await getBudgetProgress(year, month);
        return JSON.stringify({ year, month, categories: data });
      }

      case "get_income_summary": {
        const year = (input.year as number) || currentYear;
        const ytd = await getIncomeYTD(year);
        const byPeriod = await getIncomeByPeriod(year);
        return JSON.stringify({
          year,
          ytd: {
            totalGross: ytd?.total_gross || "0",
            totalNet: ytd?.total_net || "0",
            totalTaxWithheld: ytd?.total_tax || "0",
          },
          entries: byPeriod,
        });
      }

      case "get_expense_breakdown": {
        const year = (input.year as number) || currentYear;
        const month = (input.month as number) || currentMonth;
        const data = await getExpensesByMonth(year, month);
        return JSON.stringify({ year, month, categories: data });
      }

      case "get_tax_deadlines": {
        const deadlines = await getTaxDeadlines();
        return JSON.stringify({ deadlines });
      }

      case "get_tax_position": {
        const year = (input.year as number) || currentYear;
        const ytd = await getIncomeYTD(year);
        const deadlines = await getTaxDeadlines();
        const totalGross = parseFloat(ytd?.total_gross || "0");
        const totalWithheld = parseFloat(ytd?.total_tax || "0");
        // Rough estimate: 35% federal + 9.3% CA on income above standard deduction
        const estimatedFederalRate = 0.35;
        const estimatedStateRate = 0.093;
        const estimatedTotalTax = totalGross * (estimatedFederalRate + estimatedStateRate);
        const gap = estimatedTotalTax - totalWithheld;

        return JSON.stringify({
          year,
          ytdGrossIncome: totalGross,
          ytdTaxWithheld: totalWithheld,
          estimatedAnnualTax: estimatedTotalTax,
          estimatedGap: gap > 0 ? gap : 0,
          note: "Rough estimate. Actual liability depends on deductions, credits, and filing status. CPA should compute precise figures.",
          upcomingDeadlines: deadlines.filter(
            (d: Record<string, unknown>) => d.status !== "paid"
          ),
        });
      }

      case "get_cashflow_projection": {
        const bills = await getRecurringBills();
        const monthlyBills = bills.reduce(
          (sum: number, b: Record<string, unknown>) =>
            sum + parseFloat(b.amount as string),
          0
        );
        // Hardcoded monthly net income from intake data (will be dynamic later)
        const monthlyNetIncome = 44000;
        return JSON.stringify({
          monthlyNetIncome,
          monthlyRecurringBills: monthlyBills,
          estimatedMonthlySurplus: monthlyNetIncome - monthlyBills,
          billCount: bills.length,
        });
      }

      case "get_recurring_bills": {
        const bills = await getRecurringBills();
        return JSON.stringify({ bills });
      }

      case "get_alerts": {
        const alerts = await getActiveAlerts();
        return JSON.stringify({ alerts });
      }

      case "log_expense": {
        const expense = await createExpense(
          input.date as string,
          input.description as string,
          input.amount as number,
          input.category as string,
          null,
          input.personal_or_business as string,
          (input.notes as string) || null,
          userId
        );
        return JSON.stringify({ success: true, expense });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (error) {
    return JSON.stringify({
      error: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
