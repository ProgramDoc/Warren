import type Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";
import {
  getBudgetProgress,
  getIncomeYTD,
  getIncomeByPeriod,
  getTaxDeadlines,
  getRecurringBills,
  getActiveAlerts,
  getExpensesByMonth,
  createExpense,
  getDocuments,
  getDocument,
  createDocument,
} from "@/lib/db";
import { uploadToR2, getDownloadUrl } from "@/lib/storage/r2";

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
  {
    name: "list_documents",
    description:
      "List uploaded documents (receipts, tax docs, reports, statements). Can filter by category.",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: ["receipt", "tax", "report", "statement", "other"],
          description: "Filter by document category",
        },
      },
      required: [],
    },
  },
  {
    name: "get_document_download_link",
    description:
      "Get a temporary download link for a specific document by its ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        document_id: { type: "string", description: "UUID of the document" },
      },
      required: ["document_id"],
    },
  },
  {
    name: "generate_report",
    description:
      "Generate a financial report as a downloadable CSV file. The report is saved to document storage and a download link is returned. Owner only.",
    input_schema: {
      type: "object" as const,
      properties: {
        report_type: {
          type: "string",
          enum: ["expense_summary", "income_report", "budget_analysis", "tax_summary"],
          description: "Type of report to generate",
        },
        year: { type: "number", description: "Year for the report (defaults to current year)" },
        month: { type: "number", description: "Month 1-12 (optional, for monthly reports)" },
      },
      required: ["report_type"],
    },
  },
];

// Tools restricted to owner role
const OWNER_ONLY_TOOLS = new Set([
  "get_income_summary",
  "get_tax_deadlines",
  "get_tax_position",
  "generate_report",
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

      case "list_documents": {
        const category = input.category as string | undefined;
        const docs = await getDocuments(userId, role, { category });
        return JSON.stringify({
          documents: docs.map((d) => ({
            id: d.id,
            filename: d.original_filename,
            category: d.category,
            size: `${(d.size_bytes / 1024).toFixed(1)}KB`,
            uploaded: d.created_at,
            description: d.description,
          })),
        });
      }

      case "get_document_download_link": {
        const docId = input.document_id as string;
        const doc = await getDocument(docId, userId, role);
        if (!doc) {
          return JSON.stringify({ error: "Document not found or access denied" });
        }
        const url = await getDownloadUrl(doc.r2_key);
        return JSON.stringify({
          url,
          filename: doc.original_filename,
          mime_type: doc.mime_type,
        });
      }

      case "generate_report": {
        const year = (input.year as number) || currentYear;
        const month = input.month as number | undefined;
        const reportType = input.report_type as string;

        let csvContent = "";
        let filename = "";

        switch (reportType) {
          case "expense_summary": {
            const m = month || currentMonth;
            const data = await getExpensesByMonth(year, m);
            csvContent = "Category,Total\n" + (data as Array<{ category: string; total: string }>)
              .map((d) => `"${d.category}","${d.total}"`)
              .join("\n");
            filename = `expense-summary-${year}-${String(m).padStart(2, "0")}.csv`;
            break;
          }
          case "income_report": {
            const entries = await getIncomeByPeriod(year);
            csvContent = "Period,Source,Gross,Net,Tax Withheld\n" + entries
              .map((e) => `"${e.period}","${e.source}","${e.gross_amount}","${e.net_amount || ""}","${e.tax_withheld || ""}"`)
              .join("\n");
            filename = `income-report-${year}.csv`;
            break;
          }
          case "budget_analysis": {
            const m = month || currentMonth;
            const data = await getBudgetProgress(year, m);
            csvContent = "Code,Category,Budget,Spent,Remaining\n" + (data as Array<{ code: string; name: string; monthly_budget: string; spent: string }>)
              .map((d) => {
                const remaining = parseFloat(d.monthly_budget) - parseFloat(d.spent);
                return `"${d.code}","${d.name}","${d.monthly_budget}","${d.spent}","${remaining.toFixed(2)}"`;
              })
              .join("\n");
            filename = `budget-analysis-${year}-${String(m).padStart(2, "0")}.csv`;
            break;
          }
          case "tax_summary": {
            const deadlines = await getTaxDeadlines();
            const ytd = await getIncomeYTD(year);
            csvContent = "Item,Value\n";
            csvContent += `"YTD Gross Income","${ytd?.total_gross || 0}"\n`;
            csvContent += `"YTD Tax Withheld","${ytd?.total_tax || 0}"\n`;
            csvContent += `"YTD Net Income","${ytd?.total_net || 0}"\n\n`;
            csvContent += "Deadline,Description,Type,Amount,Status\n";
            csvContent += (deadlines as Array<{ deadline: string; description: string; tax_type: string; amount: string; status: string }>)
              .map((d) => `"${d.deadline}","${d.description}","${d.tax_type}","${d.amount || ""}","${d.status}"`)
              .join("\n");
            filename = `tax-summary-${year}.csv`;
            break;
          }
          default:
            return JSON.stringify({ error: `Unknown report type: ${reportType}` });
        }

        const docId = randomUUID();
        const buffer = Buffer.from(csvContent, "utf-8");
        const r2Key = await uploadToR2(userId, docId, filename, buffer, "text/csv");
        const doc = await createDocument(
          userId, filename, filename, "text/csv", buffer.length, r2Key, "report", "owner"
        );
        const url = await getDownloadUrl(r2Key);

        return JSON.stringify({
          success: true,
          document_id: doc.id,
          download_url: url,
          filename,
          note: "This link expires in 1 hour. Use get_document_download_link to get a new one.",
        });
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
