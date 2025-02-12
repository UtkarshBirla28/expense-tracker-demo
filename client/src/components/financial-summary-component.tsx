import type React from "react"
import type { FinancialSummary } from "../types"

interface FinancialSummaryComponentProps {
  summary: FinancialSummary | null
}

const FinancialSummaryComponent: React.FC<FinancialSummaryComponentProps> = ({ summary }) => {
  if (!summary) {
    return <div>Loading summary...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="mt-1 text-lg font-semibold text-green-600">${summary.totalIncome.toFixed(2)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="mt-1 text-lg font-semibold text-red-600">${summary.totalExpenses.toFixed(2)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Balance</h3>
          <p className={`mt-1 text-lg font-semibold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${summary.balance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FinancialSummaryComponent

