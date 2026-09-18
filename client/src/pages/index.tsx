import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  PiggyBank,
  PlusCircle,
  Scale,
} from "lucide-react";
import RootLayout from "../layout";
import PdfDownloader from "@/components/pdf-downloader";
import MonthlyTrendChart from "@/components/monthly-trend-chart";
import BudgetBar from "@/components/budget-bar";
import useSummary from "@/hooks/use-summary";
import useTrends from "@/hooks/use-trends";
import useBudget from "@/hooks/use-budget";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Budget, TrendPoint } from "@/types";

interface ExpenseCategory {
  name: string;
  value: number;
}

const MAX_CATEGORY_ROWS = 7;

export default function Home() {
  const navigate = useNavigate();
  const { getSummary } = useSummary();
  const { getTrends } = useTrends();
  const { getBudgets } = useBudget();
  const [expenses, setExpenses] = useState<number>(0);
  const [incomes, setIncomes] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseCategory[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [summaryRes, trendsRes, budgetsRes] = await Promise.all([
      getSummary(),
      getTrends(),
      getBudgets().catch(() => ({ budgets: [] as Budget[] })),
    ]);
    if (summaryRes) {
      setExpenses(summaryRes.summary.totalExpenses);
      setIncomes(summaryRes.summary.totalIncome);
      setCurrentBalance(summaryRes.summary.currentBalance);
      setExpensesByCategory(summaryRes.expensesByCategory);
    }
    if (trendsRes) {
      setTrends(trendsRes.trends);
    }
    setBudgets(budgetsRes.budgets);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sorted = [...(expensesByCategory ?? [])].sort(
    (a, b) => (b.value ?? 0) - (a.value ?? 0)
  );
  const top = sorted.slice(0, MAX_CATEGORY_ROWS);
  const restTotal = sorted
    .slice(MAX_CATEGORY_ROWS)
    .reduce((sum, c) => sum + (c.value ?? 0), 0);
  const rows = [
    ...top.map((c) => ({ name: c.name, amount: c.value ?? 0 })),
    ...(restTotal > 0 ? [{ name: "Other", amount: restTotal }] : []),
  ];
  const categoryTotal = rows.reduce((sum, r) => sum + r.amount, 0);
  const maxAmount = rows.length > 0 ? Math.max(...rows.map((r) => r.amount)) : 0;

  const topBudgets = [...budgets]
    .sort((a, b) => {
      const ratioA = a.amount > 0 ? a.spent / a.amount : 0;
      const ratioB = b.amount > 0 ? b.spent / b.amount : 0;
      return ratioB - ratioA;
    })
    .slice(0, 3);

  return (
    <RootLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your money at a glance.
          </p>
        </div>
        <PdfDownloader />
      </div>

      {/* KPI tiles */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Total income"
          amount={incomes}
          isLoading={isLoading}
          icon={<ArrowDownLeft className="h-4.5 w-4.5" strokeWidth={2.2} />}
          chipClass="bg-positive-soft text-positive"
        />
        <StatTile
          label="Total expenses"
          amount={expenses}
          isLoading={isLoading}
          icon={<ArrowUpRight className="h-4.5 w-4.5" strokeWidth={2.2} />}
          chipClass="bg-negative-soft text-negative"
        />
        <StatTile
          label="Balance"
          amount={currentBalance}
          isLoading={isLoading}
          icon={<Scale className="h-4.5 w-4.5" strokeWidth={2.2} />}
          chipClass="bg-primary/10 text-primary"
          valueClass={currentBalance < 0 ? "text-negative" : undefined}
        />
      </div>

      {/* Monthly trend */}
      <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold tracking-tight">
          Income vs expenses
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Last 6 months</p>
        <div className="mt-6">
          {isLoading ? (
            <Skeleton className="h-44 w-full rounded-lg" />
          ) : (
            <MonthlyTrendChart trends={trends} />
          )}
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Spending by category */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-base font-semibold tracking-tight">
              Spending by category
            </h2>
            {rows.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(categoryTotal)} total
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="mt-6 space-y-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : rows.length > 0 ? (
            <ul className="mt-6 space-y-5">
              {rows.map((row) => {
                const share = categoryTotal > 0 ? row.amount / categoryTotal : 0;
                const width = maxAmount > 0 ? (row.amount / maxAmount) * 100 : 0;
                return (
                  <li key={row.name}>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-sm font-medium capitalize">{row.name}</p>
                      <p className="text-sm tabular-nums">
                        <span className="font-medium">{formatCurrency(row.amount)}</span>
                        <span className="ml-2 text-muted-foreground">
                          {Math.round(share * 100)}%
                        </span>
                      </p>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500"
                        style={{ width: `${Math.max(width, 2)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <PlusCircle className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">No expenses yet</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Add your first expense to see your spending breakdown.
              </p>
              <button
                onClick={() => navigate("/transactions")}
                className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
              >
                Add a transaction
              </button>
            </div>
          )}
        </section>

        {/* Budgets snapshot */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold tracking-tight">Budgets</h2>
            <Link
              to="/budgets"
              className="inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
            >
              Manage
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-6 space-y-6">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : topBudgets.length > 0 ? (
            <ul className="mt-6 space-y-6">
              {topBudgets.map((budget) => (
                <li key={budget.id}>
                  <BudgetBar budget={budget} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <PiggyBank className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">No budgets yet</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Set monthly limits per category to keep spending in check.
              </p>
              <Link
                to="/budgets"
                className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
              >
                Set a budget
              </Link>
            </div>
          )}
        </section>
      </div>
    </RootLayout>
  );
}

interface StatTileProps {
  label: string;
  amount: number;
  icon: ReactNode;
  chipClass: string;
  valueClass?: string;
  isLoading: boolean;
}

function StatTile({ label, amount, icon, chipClass, valueClass, isLoading }: StatTileProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", chipClass)}>
          {icon}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-32" />
      ) : (
        <p className={cn("mt-3 text-[28px] font-semibold leading-none tracking-tight", valueClass)}>
          {formatCurrency(amount)}
        </p>
      )}
    </div>
  );
}
