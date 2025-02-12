import type { FC } from "react"
import type { Income } from "../types"
import { TrashIcon } from "@heroicons/react/24/outline"

interface IncomeListProps {
  incomes: Income[]
  onDelete: (id: string) => Promise<void>
  isLoading: boolean
}

const IncomeList: FC<IncomeListProps> = ({ incomes, onDelete, isLoading }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {isLoading && <p className="text-center p-4">Loading...</p>}
      {!isLoading && incomes.length === 0 && <p className="text-center p-4">No income records found.</p>}
    
      {/* Scrollable container with max height */}
      <div className="max-h-80 overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {incomes.map((income: Income) => (
            <li key={income.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{income.description}</p>
                  <p className="text-sm text-gray-500">{income.source}</p>
                  <p className="text-sm text-gray-500">{income.createdAt}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 font-semibold mr-4">
                    +${income.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onDelete(income.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default IncomeList
