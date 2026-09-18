import type { FC } from "react"
import type { Income } from "../types"
import TransactionList, { type TransactionRow } from "@/components/transaction-list"

interface IncomeListProps {
  incomes: Income[]
  onDelete: (id: string) => Promise<void>
  onEdit?: (row: TransactionRow) => void
  isLoading: boolean
}

const IncomeList: FC<IncomeListProps> = ({ incomes, onDelete, onEdit, isLoading }) => (
  <TransactionList
    title="Income"
    kind="income"
    rows={incomes.map((i) => ({
      id: i.id,
      description: i.description,
      tag: i.source,
      createdAt: i.createdAt,
      amount: i.amount,
    }))}
    onDelete={onDelete}
    onEdit={onEdit}
    isLoading={isLoading}
    emptyMessage="No income recorded yet."
  />
)

export default IncomeList
