import { useCallback, useEffect, useState } from "react"
import { Loader2, PiggyBank, Trash2 } from "lucide-react"
import RootLayout from "@/layout"
import BudgetBar from "@/components/budget-bar"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import useBudget from "@/hooks/use-budget"
import type { Budget } from "@/types"

export default function BudgetsPage() {
  const { getBudgets, saveBudget, deleteBudget } = useBudget()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const data = await getBudgets()
      setBudgets(data.budgets)
    } catch (error) {
      console.error("Failed to fetch budgets:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!category.trim()) {
      setFormError("Category is required")
      return
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setFormError("Enter a monthly limit above zero")
      return
    }
    setFormError(null)
    setIsSaving(true)
    try {
      await saveBudget({ category: category.trim(), amount: parsedAmount })
      setCategory("")
      setAmount("")
      await fetchData()
    } catch (error) {
      setFormError("Could not save budget. Try again.")
      console.error("Failed to save budget:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteBudget(id)
      await fetchData()
    } catch (error) {
      console.error("Failed to delete budget:", error)
    }
  }

  return (
    <RootLayout>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set a monthly limit per category. Spending resets each month.
        </p>
      </div>

      {/* Set a budget */}
      <form
        onSubmit={handleSave}
        className="mt-8 rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
              Category
            </label>
            <Input
              placeholder="e.g. food, rent, travel"
              className="h-10"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="sm:w-44">
            <label className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
              Monthly limit
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="h-10 pl-7 tabular-nums"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "Saving…" : "Set budget"}
          </button>
        </div>
        {formError && <p className="mt-2 text-sm text-negative">{formError}</p>}
        <p className="mt-3 text-xs text-muted-foreground">
          Setting a budget for an existing category updates its limit.
        </p>
      </form>

      {/* Budget list */}
      <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold tracking-tight">This month</h2>

        {isLoading ? (
          <div className="mt-6 space-y-6">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PiggyBank className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-sm font-semibold">No budgets yet</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Set a monthly limit for a category above and we&apos;ll track how
              much of it you&apos;ve spent.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-6">
            {budgets.map((budget) => (
              <li key={budget.id} className="group flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <BudgetBar budget={budget} />
                </div>
                <button
                  aria-label={`Delete ${budget.category} budget`}
                  onClick={() => handleDelete(budget.id)}
                  className="mt-0.5 shrink-0 rounded-md p-1.5 text-muted-foreground/50 opacity-0 transition-all hover:bg-negative-soft hover:text-negative focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </RootLayout>
  )
}
