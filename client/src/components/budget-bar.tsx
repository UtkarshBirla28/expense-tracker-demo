import type { FC } from "react"
import { AlertTriangle } from "lucide-react"
import type { Budget } from "@/types"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

/*
 * Status colors from the dataviz reference status palette (never reused as
 * series colors). Over-budget always pairs the color with an icon + text.
 */
const WARNING = "#fab219"
const CRITICAL = "#d03b3b"
const OK = "#2a78d6"

interface BudgetBarProps {
  budget: Budget
  compact?: boolean
}

const BudgetBar: FC<BudgetBarProps> = ({ budget, compact = false }) => {
  const ratio = budget.amount > 0 ? budget.spent / budget.amount : 0
  const over = ratio > 1
  const near = ratio >= 0.8 && !over
  const barColor = over ? CRITICAL : near ? WARNING : OK
  const remaining = budget.amount - budget.spent

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium capitalize">{budget.category}</p>
        <p className="text-sm tabular-nums text-muted-foreground">
          <span className={cn("font-medium", over ? "text-negative" : "text-foreground")}>
            {formatCurrency(budget.spent)}
          </span>
          {" / "}
          {formatCurrency(budget.amount)}
        </p>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="animate-grow-x h-full rounded-full"
          style={{
            width: `${Math.min(ratio * 100, 100)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      {!compact && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          {over ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5 text-negative" />
              <span className="text-negative">
                {formatCurrency(Math.abs(remaining))} over budget this month
              </span>
            </>
          ) : (
            `${formatCurrency(remaining)} left this month`
          )}
        </p>
      )}
    </div>
  )
}

export default BudgetBar
