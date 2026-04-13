"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface DashboardData {
  user: { displayName: string; role: string };
  lastUpdated: string;
  income?: {
    tomUclaYTD: number;
    tomAiTheiaYTD: number;
    slYTD: number;
    totalYTD: number;
    projectedAnnual: number;
  };
  cashPosition?: {
    monthlyNetIncome: number;
    monthlyFixedCosts: number;
    estimatedMonthlySurplus: number;
  };
  budgetProgress?: Record<
    string,
    { spent: number; budget: number; category: string }
  >;
  upcomingBills?: Array<{
    description: string;
    amount: string;
    dueDate: string;
    urgent?: boolean;
  }>;
  taxDeadlines?: Array<{
    deadline: string;
    description: string;
    daysAway: number;
    status: string;
  }>;
  alerts?: Array<{ level: string; message: string }>;
  properties?: Record<
    string,
    {
      grossRent: number;
      netMonthly: number;
      status: string;
    }
  >;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function Card({
  title,
  children,
  className = "",
  urgent = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  urgent?: boolean;
}) {
  return (
    <div
      className={`bg-gray-900 rounded-xl border ${
        urgent ? "border-red-700" : "border-gray-800"
      } p-6 ${className}`}
    >
      <h3
        className={`text-sm font-medium ${
          urgent ? "text-red-400" : "text-gray-400"
        } mb-4`}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (!session.authenticated) {
        if (session.needsSetup) {
          router.push("/setup");
        } else {
          router.push("/login");
        }
        return;
      }

      const res = await fetch("/api/dashboard");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      console.error("Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) return null;

  const isOwner = data.user.role === "owner";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Warren</h1>
            <p className="text-sm text-gray-400">
              {data.user.displayName} &middot;{" "}
              {isOwner ? "Owner" : "Household"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              Updated {new Date(data.lastUpdated).toLocaleTimeString()}
            </span>
            <button
              onClick={() => router.push("/settings")}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {data.alerts && data.alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {data.alerts.map((alert, i) => (
              <div
                key={i}
                className={`px-4 py-3 rounded-lg border text-sm ${
                  alert.level === "urgent"
                    ? "bg-red-950 border-red-800 text-red-300"
                    : alert.level === "warning"
                    ? "bg-yellow-950 border-yellow-800 text-yellow-300"
                    : "bg-blue-950 border-blue-800 text-blue-300"
                }`}
              >
                <span className="font-medium uppercase text-xs mr-2">
                  {alert.level}
                </span>
                {alert.message}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cash Position (owner only) */}
          {isOwner && data.cashPosition && (
            <Card title="CASH POSITION">
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-400 text-sm">Monthly Net Income</span>
                  <span className="text-2xl font-bold text-green-400">
                    {formatCurrency(data.cashPosition.monthlyNetIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-400 text-sm">Monthly Fixed Costs</span>
                  <span className="text-lg text-red-400">
                    {formatCurrency(data.cashPosition.monthlyFixedCosts)}
                  </span>
                </div>
                <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
                  <span className="text-gray-300 text-sm font-medium">
                    Est. Surplus
                  </span>
                  <span className="text-xl font-bold text-emerald-400">
                    {formatCurrency(data.cashPosition.estimatedMonthlySurplus)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Income YTD (owner only) */}
          {isOwner && data.income && (
            <Card title="INCOME YTD (2026)">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Tom — UCLA</span>
                  <span className="text-white">
                    {formatCurrency(data.income.tomUclaYTD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Tom — AiTheia</span>
                  <span className="text-white">
                    {formatCurrency(data.income.tomAiTheiaYTD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">SL</span>
                  <span className="text-white">
                    {formatCurrency(data.income.slYTD)}
                  </span>
                </div>
                <div className="border-t border-gray-800 pt-2 flex justify-between">
                  <span className="text-gray-300 text-sm font-medium">Total YTD</span>
                  <span className="text-xl font-bold text-white">
                    {formatCurrency(data.income.totalYTD)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  Projected annual: {formatCurrency(data.income.projectedAnnual)}
                </div>
              </div>
            </Card>
          )}

          {/* Tax Deadlines (owner only) */}
          {isOwner && data.taxDeadlines && (
            <Card
              title="TAX DEADLINES"
              urgent={data.taxDeadlines.some((d) => d.daysAway <= 7)}
            >
              <div className="space-y-3">
                {data.taxDeadlines.slice(0, 4).map((deadline, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm text-white">
                        {deadline.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {deadline.deadline}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        deadline.status === "NOT PAID"
                          ? "bg-red-900 text-red-300"
                          : deadline.status === "EXTENSION FILED"
                          ? "bg-yellow-900 text-yellow-300"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {deadline.daysAway <= 7
                        ? `${deadline.daysAway}d`
                        : deadline.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Budget Progress (shared) */}
          {data.budgetProgress && (
            <Card title="BUDGET PROGRESS (MTD)">
              <div className="space-y-4">
                {Object.values(data.budgetProgress).map((item, i) => {
                  const pct = Math.round((item.spent / item.budget) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{item.category}</span>
                        <span className="text-gray-300">
                          {formatCurrency(item.spent)} /{" "}
                          {formatCurrency(item.budget)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            pct >= 100
                              ? "bg-red-500"
                              : pct >= 80
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Upcoming Bills (shared) */}
          {data.upcomingBills && (
            <Card
              title="UPCOMING BILLS"
              urgent={data.upcomingBills.some((b) => b.urgent)}
            >
              <div className="space-y-3">
                {data.upcomingBills.map((bill, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2"
                  >
                    <div>
                      <p
                        className={`text-sm ${
                          bill.urgent ? "text-red-300" : "text-white"
                        }`}
                      >
                        {bill.description}
                      </p>
                      <p className="text-xs text-gray-500">{bill.dueDate}</p>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        bill.urgent ? "text-red-400" : "text-gray-300"
                      }`}
                    >
                      {bill.amount}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Properties (owner only) */}
          {isOwner && data.properties && (
            <Card title="RENTAL PROPERTIES">
              <div className="space-y-4">
                {Object.entries(data.properties).map(([name, prop]) => (
                  <div key={name} className="border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-medium text-white capitalize">
                        {name}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          prop.netMonthly >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatCurrency(prop.netMonthly)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Rent: {formatCurrency(prop.grossRent)}/mo</span>
                      <span>{prop.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
