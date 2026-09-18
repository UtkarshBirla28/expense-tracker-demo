import type { FC } from "react"
import type { Expense } from "@/types"
import TransactionList from "@/components/transaction-list"

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => Promise<void>
  isLoading: boolean
  error?: string | null
}

const ExpenseList: FC<ExpenseListProps> = ({ expenses, onDelete, isLoading, error }) => (
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
    isLoading={isLoading}
    error={error}
    emptyMessage="No expenses recorded yet."
  />
)

export default ExpenseList
