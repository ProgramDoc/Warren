import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getIncomeYTD,
  getRecurringBills,
  getTaxDeadlines,
  getActiveAlerts,
  getBudgetProgress,
  getExpensesByMonth,
} from "@/lib/db";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = session.role === "owner";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const dashboard: Record<string, unknown> = {
    user: {
      displayName: session.display_name,
      role: session.role,
    },
    lastUpdated: now.toISOString(),
  };

  // --- Shared data (owner + household) ---

  // Budget progress
  try {
    const budgetData = await getBudgetProgress(year, month);
    if (budgetData.length > 0) {
      dashboard.budgetProgress = budgetData.reduce(
        (acc, item) => {
          const row = item as { code: string; name: string; monthly_budget: string; spent: string };
          acc[row.code] = {
            category: row.name,
            budget: parseFloat(row.monthly_budget),
            spent: parseFloat(row.spent),
          };
          return acc;
        },
        {} as Record<string, { category: string; budget: number; spent: number }>
      );
    } else {
      // Fallback with initial data from intake
      dashboard.budgetProgress = {
        "P-HOU": { category: "Housing", budget: 12000, spent: 10144 },
        "P-TRN": { category: "Transportation", budget: 2000, spent: 1786 },
        "P-CHD": { category: "Childcare", budget: 4000, spent: 3490 },
        "P-HLT": { category: "Health & Fitness", budget: 1000, spent: 812 },
      };
    }
  } catch {
    dashboard.budgetProgress = {};
  }

  // Upcoming bills
  try {
    const bills = await getRecurringBills();
    dashboard.recurringBills = bills;
  } catch {
    dashboard.recurringBills = [];
  }

  // --- Owner-only data ---
  if (isOwner) {
    // Income YTD
    try {
      const incomeYTD = await getIncomeYTD(year);
      if (incomeYTD) {
        dashboard.income = {
          totalGrossYTD: parseFloat(incomeYTD.total_gross),
          totalNetYTD: parseFloat(incomeYTD.total_net),
          totalTaxYTD: parseFloat(incomeYTD.total_tax),
          // Hardcoded from intake until Plaid/sync is set up
          tomUclaYTD: 98241.16,
          tomAiTheiaYTD: 62125,
          slYTD: 39570.7,
          totalYTD: 199936.86,
          projectedAnnual: 800000,
        };
      } else {
        dashboard.income = {
          tomUclaYTD: 98241.16,
          tomAiTheiaYTD: 62125,
          slYTD: 39570.7,
          totalYTD: 199936.86,
          projectedAnnual: 800000,
        };
      }
    } catch {
      dashboard.income = {
        tomUclaYTD: 98241.16,
        tomAiTheiaYTD: 62125,
        slYTD: 39570.7,
        totalYTD: 199936.86,
        projectedAnnual: 800000,
      };
    }

    // Cash position
    dashboard.cashPosition = {
      monthlyNetIncome: 44000,
      monthlyFixedCosts: 20000,
      estimatedMonthlySurplus: 24000,
    };

    // Tax deadlines
    try {
      const deadlines = await getTaxDeadlines();
      if (deadlines.length > 0) {
        dashboard.taxDeadlines = deadlines.map((d) => {
          const dl = d as { deadline: string; description: string; status: string; amount: string | null };
          const deadlineDate = new Date(dl.deadline);
          const daysAway = Math.ceil(
            (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return { ...dl, daysAway };
        });
      } else {
        // Fallback from intake data
        dashboard.taxDeadlines = [
          { deadline: "2026-04-15", description: "Q1 2026 Federal Estimated Tax", daysAway: 3, status: "not_paid" },
          { deadline: "2026-04-15", description: "Q1 2026 CA Estimated Tax", daysAway: 3, status: "not_paid" },
          { deadline: "2026-04-15", description: "CA LLC Fee (AiTheia)", daysAway: 3, status: "upcoming" },
          { deadline: "2026-06-15", description: "Q2 2026 Federal Estimated Tax", daysAway: 64, status: "upcoming" },
          { deadline: "2026-10-15", description: "2025 Tax Return (extended)", daysAway: 186, status: "extension" },
        ];
      }
    } catch {
      dashboard.taxDeadlines = [];
    }

    // Alerts
    try {
      const alerts = await getActiveAlerts();
      if (alerts.length > 0) {
        dashboard.alerts = alerts;
      } else {
        dashboard.alerts = [
          { level: "urgent", message: "April 15 deadline in 3 days — estimated taxes + LLC fee due" },
          { level: "warning", message: "SL paystub needed for complete withholding analysis" },
          { level: "info", message: "Financial intake completed — 8 follow-up items pending" },
        ];
      }
    } catch {
      dashboard.alerts = [];
    }

    // Properties
    dashboard.properties = {
      tampa: { grossRent: 1500, netMonthly: 298, status: "Rented from April 2026" },
      rochester: { grossRent: 2900, netMonthly: -668, status: "Active" },
    };

    // MTD expenses
    try {
      const mtdExpenses = await getExpensesByMonth(year, month);
      dashboard.mtdExpenses = mtdExpenses;
    } catch {
      dashboard.mtdExpenses = [];
    }
  }

  return NextResponse.json(dashboard);
}
