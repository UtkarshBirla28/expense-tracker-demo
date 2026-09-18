import { useCallback, useEffect, useState } from "react"
import { Loader2, PartyPopper, Plus, Target, Trash2 } from "lucide-react"
import RootLayout from "@/layout"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import useGoal from "@/hooks/use-goal"
import { formatCurrency } from "@/lib/format"
import type { Goal } from "@/types"
import { useToast } from "@/components/toast"

export default function GoalsPage() {
  const { toast } = useToast()
  const { getGoals, addGoal, contributeToGoal, deleteGoal } = useGoal()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [target, setTarget] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const data = await getGoals()
      setGoals(data.goals)
    } catch (error) {
      console.error("Failed to fetch goals:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedTarget = parseFloat(target)
    if (!name.trim()) {
      setFormError("Give your goal a name")
      return
    }
    if (!parsedTarget || parsedTarget <= 0) {
      setFormError("Enter a target amount above zero")
      return
    }
    setFormError(null)
    setIsSaving(true)
    try {
      await addGoal({ name: name.trim(), targetAmount: parsedTarget })
      toast(`Goal "${name.trim()}" created`)
      setName("")
      setTarget("")
      await fetchData()
    } catch (error) {
      setFormError("Could not create goal. Try again.")
      console.error("Failed to create goal:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleContribute = async (id: number, amount: number) => {
    try {
      await contributeToGoal(id, amount)
      toast(`${formatCurrency(amount)} added to your goal`)
      await fetchData()
    } catch (error) {
      toast("Could not add contribution", "error")
      console.error("Failed to add contribution:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteGoal(id)
      toast("Goal deleted")
      await fetchData()
    } catch (error) {
      toast("Could not delete goal", "error")
      console.error("Failed to delete goal:", error)
    }
  }

  return (
    <RootLayout>
      <div className="animate-rise">
        <h1 className="text-2xl font-semibold tracking-tight">Savings goals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Put money aside for the things you&apos;re working toward.
        </p>
      </div>

      {/* Create a goal */}
      <form
        onSubmit={handleCreate}
        className="animate-rise mt-8 rounded-xl border border-border bg-card p-5 shadow-sm"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
              Goal name
            </label>
            <Input
              placeholder="e.g. Emergency fund, New laptop"
              className="h-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="sm:w-44">
            <label className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
              Target amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="h-10 pl-7 tabular-nums"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "Creating…" : "Create goal"}
          </button>
        </div>
        {formError && <p className="mt-2 text-sm text-negative">{formError}</p>}
      </form>

      {/* Goal cards */}
      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-4 h-2 w-full rounded-full" />
              <Skeleton className="mt-3 h-4 w-28" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-border bg-card py-14 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Target className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-sm font-semibold">No goals yet</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Create your first goal above and start putting money toward it.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onContribute={handleContribute}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </RootLayout>
  )
}

interface GoalCardProps {
  goal: Goal
  onContribute: (id: number, amount: number) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

function GoalCard({ goal, onContribute, onDelete }: GoalCardProps) {
  const [amount, setAmount] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const ratio = goal.targetAmount > 0 ? goal.savedAmount / goal.targetAmount : 0
  const done = ratio >= 1

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) return
    setIsAdding(true)
    try {
      await onContribute(goal.id, parsed)
      setAmount("")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="card-lift animate-rise group rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {done ? <PartyPopper className="h-4.5 w-4.5" /> : <Target className="h-4.5 w-4.5" />}
          </span>
          <div>
            <p className="text-sm font-semibold">{goal.name}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatCurrency(goal.savedAmount)} of {formatCurrency(goal.targetAmount)}
            </p>
          </div>
        </div>
        <button
          aria-label={`Delete ${goal.name}`}
          onClick={() => onDelete(goal.id)}
          className="rounded-md p-1.5 text-muted-foreground/50 opacity-0 transition-all hover:bg-negative-soft hover:text-negative focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {done
          ? "Goal reached — congratulations!"
          : `${Math.round(ratio * 100)}% saved · ${formatCurrency(goal.targetAmount - goal.savedAmount)} to go`}
      </p>

      {!done && (
        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
              ₹
            </span>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="Add amount"
              className="h-9 pl-7 tabular-nums"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </form>
      )}
    </div>
  )
}
