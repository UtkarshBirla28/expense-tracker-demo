import type { FC } from "react"
import type { Expense } from "@/types"
import TransactionList, { type TransactionRow } from "@/components/transaction-list"

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => Promise<void>
  onEdit?: (row: TransactionRow) => void
  isLoading: boolean
  error?: string | null
}

const ExpenseList: FC<ExpenseListProps> = ({ expenses, onDelete, onEdit, isLoading, error }) => (
  <TransactionList
    title="Expenses"
    kind="expense"
    rows={expenses.map((e) => ({
      id: e.id,
      description: e.description,
      tag: e.category,
      createdAt: e.createdAt,
      amount: e.amount,
    }))}
    onDelete={onDelete}
    onEdit={onEdit}
    isLoading={isLoading}
    error={error}
    emptyMessage="No expenses recorded yet."
  />
)

export default ExpenseList
