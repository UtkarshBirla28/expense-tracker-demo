import type { FC } from "react"
import type { Income } from "../types"
import TransactionList from "@/components/transaction-list"

interface IncomeListProps {
  incomes: Income[]
  onDelete: (id: string) => Promise<void>
  isLoading: boolean
}

const IncomeList: FC<IncomeListProps> = ({ incomes, onDelete, isLoading }) => (
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
    isLoading={isLoading}
    emptyMessage="No income recorded yet."
  />
)

export default IncomeList
