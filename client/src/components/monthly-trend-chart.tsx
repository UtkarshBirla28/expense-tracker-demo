import { useState, type FC } from "react"
import type { TrendPoint } from "@/types"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

/*
 * Grouped bar chart: income vs expenses per month, with a hover tooltip.
 * Colors are categorical slots 2 (aqua) and 6 (red) from the validated
 * dataviz reference palette — CVD-separated pair; identity is also carried
 * by the legend and tooltip values, never color alone.
 */
const INCOME_COLOR = "#1baf7a"
const EXPENSE_COLOR = "#e34948"

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function monthLabel(key: string): string {
  const monthIndex = Number(key.split("-")[1]) - 1
  return MONTH_LABELS[monthIndex] ?? key
}

/** Compact rupee label for axis ticks, e.g. ₹1.2L, ₹85k */
function compactRupees(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1).replace(/\.0$/, "")}L`
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`
  return `₹${Math.round(value)}`
}

interface MonthlyTrendChartProps {
  trends: TrendPoint[]
}

const MonthlyTrendChart: FC<MonthlyTrendChartProps> = ({ trends }) => {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...trends.map((t) => Math.max(t.income, t.expense)), 0)

  if (max === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No activity in the last 6 months yet.
      </p>
    )
  }

  return (
    <div>
      <div className="relative" style={{ height: 190 }}>
        {/* Recessive gridlines with compact rupee ticks */}
        {[1, 0.5].map((fraction) => (
          <div
            key={fraction}
            className="absolute inset-x-0 flex items-center gap-2"
            style={{ bottom: `${fraction * 100}%` }}
          >
            <span className="w-10 shrink-0 text-right text-[10px] leading-none text-muted-foreground/80 tabular-nums">
              {compactRupees(max * fraction)}
            </span>
            <div className="h-px flex-1 bg-border/70" />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2">
          <span className="w-10 shrink-0 text-right text-[10px] leading-none text-muted-foreground/80">
            ₹0
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Bars */}
        <div className="absolute inset-y-0 left-12 right-0 flex items-end gap-2 sm:gap-4">
          {trends.map((point, index) => {
            const isDimmed = hovered !== null && hovered !== index
            return (
              <div
                key={point.month}
                className="relative flex h-full flex-1 cursor-pointer flex-col justify-end rounded-lg transition-colors hover:bg-muted/50"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {hovered === index && (
                  <div className="animate-pop pointer-events-none absolute -top-1 left-1/2 z-10 w-40 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover p-3 shadow-lg">
                    <p className="text-xs font-semibold">{monthLabel(point.month)}</p>
                    <div className="mt-1.5 space-y-1">
                      <p className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: INCOME_COLOR }} />
                          Income
                        </span>
                        <span className="font-medium tabular-nums">{formatCurrency(point.income)}</span>
                      </p>
                      <p className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: EXPENSE_COLOR }} />
                          Expenses
                        </span>
                        <span className="font-medium tabular-nums">{formatCurrency(point.expense)}</span>
                      </p>
                      <p className="flex items-center justify-between gap-3 border-t border-border pt-1 text-xs">
                        <span className="text-muted-foreground">Saved</span>
                        <span
                          className={cn(
                            "font-medium tabular-nums",
                            point.income - point.expense >= 0 ? "text-positive" : "text-negative"
                          )}
                        >
                          {formatCurrency(point.income - point.expense)}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex h-full items-end justify-center gap-1 px-1 pb-px">
                  <div
                    className="animate-grow-y w-full max-w-6 rounded-t-[4px] transition-opacity duration-200"
                    style={{
                      height: `${(point.income / max) * 100}%`,
                      minHeight: point.income > 0 ? 3 : 0,
                      backgroundColor: INCOME_COLOR,
                      opacity: isDimmed ? 0.35 : 1,
                      animationDelay: `${index * 70}ms`,
                    }}
                  />
                  <div
                    className="animate-grow-y w-full max-w-6 rounded-t-[4px] transition-opacity duration-200"
                    style={{
                      height: `${(point.expense / max) * 100}%`,
                      minHeight: point.expense > 0 ? 3 : 0,
                      backgroundColor: EXPENSE_COLOR,
                      opacity: isDimmed ? 0.35 : 1,
                      animationDelay: `${index * 70 + 35}ms`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-2 flex gap-2 pl-12 sm:gap-4">
        {trends.map((point, index) => (
          <p
            key={point.month}
            className={cn(
              "flex-1 text-center text-xs transition-colors",
              hovered === index ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {monthLabel(point.month)}
          </p>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-5 pl-12">
        <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: INCOME_COLOR }} />
          Income
        </span>
        <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: EXPENSE_COLOR }} />
          Expenses
        </span>
      </div>
    </div>
  )
}

export default MonthlyTrendChart
