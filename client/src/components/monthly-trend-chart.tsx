import type { FC } from "react"
import type { TrendPoint } from "@/types"
import { formatCurrency } from "@/lib/format"

/*
 * Grouped bar chart: income vs expenses per month.
 * Colors are categorical slots 2 (aqua) and 6 (red) from the validated
 * dataviz reference palette — CVD-separated pair; identity is also carried
 * by the legend and hover values, never color alone.
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

interface MonthlyTrendChartProps {
  trends: TrendPoint[]
}

const MonthlyTrendChart: FC<MonthlyTrendChartProps> = ({ trends }) => {
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
      <div className="flex items-end gap-2 sm:gap-4" style={{ height: 180 }}>
        {trends.map((point, index) => (
          <div key={point.month} className="flex h-full flex-1 flex-col justify-end">
            <div className="flex h-full items-end justify-center gap-1">
              <div
                title={`Income ${monthLabel(point.month)}: ${formatCurrency(point.income)}`}
                className="animate-grow-y w-full max-w-6 rounded-t-[4px] transition-opacity hover:opacity-80"
                style={{
                  height: `${(point.income / max) * 100}%`,
                  minHeight: point.income > 0 ? 3 : 0,
                  backgroundColor: INCOME_COLOR,
                  animationDelay: `${index * 70}ms`,
                }}
              />
              <div
                title={`Expenses ${monthLabel(point.month)}: ${formatCurrency(point.expense)}`}
                className="animate-grow-y w-full max-w-6 rounded-t-[4px] transition-opacity hover:opacity-80"
                style={{
                  height: `${(point.expense / max) * 100}%`,
                  minHeight: point.expense > 0 ? 3 : 0,
                  backgroundColor: EXPENSE_COLOR,
                  animationDelay: `${index * 70 + 35}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2 border-t border-border pt-2 sm:gap-4">
        {trends.map((point) => (
          <p
            key={point.month}
            className="flex-1 text-center text-xs text-muted-foreground"
          >
            {monthLabel(point.month)}
          </p>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-5">
        <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: INCOME_COLOR }}
          />
          Income
        </span>
        <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: EXPENSE_COLOR }}
          />
          Expenses
        </span>
      </div>
    </div>
  )
}

export default MonthlyTrendChart
