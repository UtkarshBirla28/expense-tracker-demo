import type { FC, ReactNode } from "react"
import { ArrowDownLeft, ArrowUpRight, Inbox, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface TransactionRow {
  id: string
  description: string
  tag: string
  createdAt: string
  amount: number
}

interface TransactionListProps {
  title: string
  kind: "expense" | "income"
  rows: TransactionRow[]
  onDelete: (id: string) => Promise<void>
  isLoading: boolean
  error?: string | null
  emptyMessage: string
}

function ListShell({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
            {count}
          </span>
        )}
      </header>
      {children}
    </section>
  )
}

const TransactionList: FC<TransactionListProps> = ({
  title,
  kind,
  rows,
  onDelete,
  isLoading,
  error,
  emptyMessage,
}) => {
  const isExpense = kind === "expense"

  if (isLoading) {
    return (
      <ListShell title={title}>
        <div className="space-y-4 p-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </ListShell>
    )
  }

  if (error) {
    return (
      <ListShell title={title}>
        <p className="px-5 py-8 text-center text-sm text-negative">{error}</p>
      </ListShell>
    )
  }

  if (rows.length === 0) {
    return (
      <ListShell title={title}>
        <div className="flex flex-col items-center px-5 py-10 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </ListShell>
    )
  }

  return (
    <ListShell title={title} count={rows.length}>
      <ul className="max-h-96 divide-y divide-border overflow-y-auto">
        {rows.map((row) => (
          <li
            key={row.id}
            className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                isExpense
                  ? "bg-negative-soft text-negative"
                  : "bg-positive-soft text-positive"
              )}
            >
              {isExpense ? (
                <ArrowUpRight className="h-4.5 w-4.5" strokeWidth={2.2} />
              ) : (
                <ArrowDownLeft className="h-4.5 w-4.5" strokeWidth={2.2} />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{row.description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <span className="capitalize">{row.tag}</span>
                <span className="mx-1.5">·</span>
                {formatDate(row.createdAt)}
              </p>
            </div>

            <p
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                isExpense ? "text-negative" : "text-positive"
              )}
            >
              {isExpense ? "−" : "+"}
              {formatCurrency(row.amount)}
            </p>

            <button
              aria-label={`Delete ${row.description}`}
              onClick={() => onDelete(row.id)}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground/50 opacity-0 transition-all hover:bg-negative-soft hover:text-negative focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </ListShell>
  )
}

export default TransactionList
