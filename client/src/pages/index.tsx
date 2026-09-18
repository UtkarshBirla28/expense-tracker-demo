import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  PartyPopper,
  PiggyBank,
  PlusCircle,
  Scale,
  Target,
} from "lucide-react";
import RootLayout from "../layout";
import PdfDownloader from "@/components/pdf-downloader";
import MonthlyTrendChart from "@/components/monthly-trend-chart";
import BudgetBar from "@/components/budget-bar";
import useSummary from "@/hooks/use-summary";
import useTrends from "@/hooks/use-trends";
import useBudget from "@/hooks/use-budget";
import useGoal from "@/hooks/use-goal";
import useExpense from "@/hooks/use-expense";
import useIncome from "@/hooks/use-income";
import useCountUp from "@/hooks/use-count-up";
import { formatCurrency, formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Budget, Expense, Goal, Income, TrendPoint } from "@/types";

interface ExpenseCategory {
  name: string;
  value: number;
}

interface ActivityRow {
  key: string;
  kind: "expense" | "income";
  description: string;
  tag: string;
  createdAt: string;
  amount: number;
}

const MAX_CATEGORY_ROWS = 7;

export default function Home() {
  const navigate = useNavigate();
  const { getSummary } = useSummary();
  const { getTrends } = useTrends();
  const { getBudgets } = useBudget();
  const { getGoals } = useGoal();
  const { getExpenses } = useExpense();
  const { getIncomes } = useIncome();
  const [expenses, setExpenses] = useState<number>(0);
  const [incomes, setIncomes] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseCategory[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [summaryRes, trendsRes, budgetsRes, goalsRes, expensesRes, incomesRes] =
      await Promise.all([
        getSummary(),
        getTrends(),
        getBudgets().catch(() => ({ budgets: [] as Budget[] })),
        getGoals().catch(() => ({ goals: [] as Goal[] })),
        getExpenses().catch(() => ({ expenses: [] as Expense[], message: "" })),
        getIncomes().catch(() => ({ incomes: [] as Income[], message: "" })),
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
    setGoals(goalsRes.goals);

    const merged: ActivityRow[] = [
      ...expensesRes.expenses.map((e) => ({
        key: `e-${e.id}`,
        kind: "expense" as const,
        description: e.description,
        tag: e.category,
        createdAt: e.createdAt,
        amount: e.amount,
      })),
      ...incomesRes.incomes.map((i) => ({
        key: `i-${i.id}`,
        kind: "income" as const,
        description: i.description,
        tag: i.source,
        createdAt: i.createdAt,
        amount: i.amount,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
    setActivity(merged);
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

  const topGoals = goals.slice(0, 3);

  return (
    <RootLayout>
      <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
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
          delay={0}
          icon={<ArrowDownLeft className="h-4.5 w-4.5" strokeWidth={2.2} />}
          chipClass="bg-positive-soft text-positive"
        />
        <StatTile
          label="Total expenses"
          amount={expenses}
          isLoading={isLoading}
          delay={80}
          icon={<ArrowUpRight className="h-4.5 w-4.5" strokeWidth={2.2} />}
          chipClass="bg-negative-soft text-negative"
        />
        <StatTile
          label="Balance"
          amount={currentBalance}
          isLoading={isLoading}
          delay={160}
          icon={<Scale className="h-4.5 w-4.5" strokeWidth={2.2} />}
          chipClass="bg-primary/10 text-primary"
          valueClass={currentBalance < 0 ? "text-negative" : undefined}
        />
      </div>

      {/* Monthly trend */}
      <section
        className="animate-rise mt-6 rounded-xl border border-border bg-card p-6 shadow-sm"
        style={{ animationDelay: "180ms" }}
      >
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
        <section
          className="animate-rise rounded-xl border border-border bg-card p-6 shadow-sm"
          style={{ animationDelay: "260ms" }}
        >
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
            <CategorySkeleton />
          ) : rows.length > 0 ? (
            <ul className="mt-6 space-y-5">
              {rows.map((row, index) => {
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
                        className="animate-grow-x h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.max(width, 2)}%`,
                          animationDelay: `${300 + index * 70}ms`,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyPanel
              icon={<PlusCircle className="h-6 w-6" />}
              title="No expenses yet"
              body="Add your first expense to see your spending breakdown."
            >
              <button
                onClick={() => navigate("/transactions")}
                className="press mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
              >
                Add a transaction
              </button>
            </EmptyPanel>
          )}
        </section>

        {/* Budgets snapshot */}
        <section
          className="animate-rise rounded-xl border border-border bg-card p-6 shadow-sm"
          style={{ animationDelay: "320ms" }}
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold tracking-tight">Budgets</h2>
            <Link
              to="/budgets"
              className="group inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
            >
              Manage
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {isLoading ? (
            <CategorySkeleton />
          ) : topBudgets.length > 0 ? (
            <ul className="mt-6 space-y-6">
              {topBudgets.map((budget) => (
                <li key={budget.id}>
                  <BudgetBar budget={budget} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPanel
              icon={<PiggyBank className="h-6 w-6" />}
              title="No budgets yet"
              body="Set monthly limits per category to keep spending in check."
            >
              <Link
                to="/budgets"
                className="press mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
              >
                Set a budget
              </Link>
            </EmptyPanel>
          )}
        </section>

        {/* Goals snapshot */}
        <section
          className="animate-rise rounded-xl border border-border bg-card p-6 shadow-sm"
          style={{ animationDelay: "380ms" }}
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold tracking-tight">Savings goals</h2>
            <Link
              to="/goals"
              className="group inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {isLoading ? (
            <CategorySkeleton />
          ) : topGoals.length > 0 ? (
            <ul className="mt-6 space-y-6">
              {topGoals.map((goal, index) => {
                const ratio =
                  goal.targetAmount > 0 ? goal.savedAmount / goal.targetAmount : 0;
                const done = ratio >= 1;
                return (
                  <li key={goal.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        {done ? (
                          <PartyPopper className="h-4 w-4 text-positive" />
                        ) : (
                          <Target className="h-4 w-4 text-primary" />
                        )}
                        {goal.name}
                      </p>
                      <p className="text-sm tabular-nums text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {formatCurrency(goal.savedAmount)}
                        </span>
                        {" / "}
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "animate-grow-x h-full rounded-full",
                          done ? "bg-positive" : "bg-primary"
                        )}
                        style={{
                          width: `${Math.min(ratio * 100, 100)}%`,
                          animationDelay: `${400 + index * 70}ms`,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyPanel
              icon={<Target className="h-6 w-6" />}
              title="No goals yet"
              body="Create a savings goal and put money toward it."
            >
              <Link
                to="/goals"
                className="press mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
              >
                Create a goal
              </Link>
            </EmptyPanel>
          )}
        </section>

        {/* Recent activity */}
        <section
          className="animate-rise rounded-xl border border-border bg-card p-6 shadow-sm"
          style={{ animationDelay: "440ms" }}
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold tracking-tight">Recent activity</h2>
            <Link
              to="/transactions"
              className="group inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {isLoading ? (
            <CategorySkeleton />
          ) : activity.length > 0 ? (
            <ul className="mt-4 -mx-2">
              {activity.map((row, index) => (
                <li
                  key={row.key}
                  className="animate-fade-in flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
                  style={{ animationDelay: `${450 + index * 60}ms` }}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      row.kind === "expense"
                        ? "bg-negative-soft text-negative"
                        : "bg-positive-soft text-positive"
                    )}
                  >
                    {row.kind === "expense" ? (
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" strokeWidth={2.2} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{row.description}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="capitalize">{row.tag}</span>
                      <span className="mx-1.5">·</span>
                      {formatDate(row.createdAt)}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      row.kind === "expense" ? "text-negative" : "text-positive"
                    )}
                  >
                    {row.kind === "expense" ? "−" : "+"}
                    {formatCurrency(row.amount)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPanel
              icon={<PlusCircle className="h-6 w-6" />}
              title="Nothing recorded yet"
              body="Your latest transactions will show up here."
            />
          )}
        </section>
      </div>
    </RootLayout>
  );
}

function CategorySkeleton() {
  return (
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
  );
}

function EmptyPanel({
  icon,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="animate-pop flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
      {children}
    </div>
  );
}

interface StatTileProps {
  label: string;
  amount: number;
  icon: ReactNode;
  chipClass: string;
  valueClass?: string;
  isLoading: boolean;
  delay: number;
}

function StatTile({ label, amount, icon, chipClass, valueClass, isLoading, delay }: StatTileProps) {
  const animated = useCountUp(amount);
  return (
    <div
      className="card-lift animate-rise rounded-xl border border-border bg-card p-5 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "animate-pop flex h-8 w-8 items-center justify-center rounded-lg",
            chipClass
          )}
          style={{ animationDelay: `${delay + 200}ms` }}
        >
          {icon}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-32" />
      ) : (
        <p className={cn("mt-3 text-[28px] font-semibold leading-none tracking-tight tabular-nums", valueClass)}>
          {formatCurrency(animated)}
        </p>
      )}
    </div>
  );
}
