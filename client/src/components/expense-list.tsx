import type { FC } from "react"
import type { Expense } from "@/types"
import { TrashIcon } from "@heroicons/react/24/outline"


const ExpenseList: FC<any> = ({ expenses, onDelete, isLoading, error }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {isLoading && <p className="text-center p-4">Loading...</p>}
      {error && <p className="text-center p-4 text-red-500">{error}</p>}
      {!isLoading && !error && expenses.length === 0 && <p className="text-center p-4">No expense records found.</p>}
    
      {/* Scrollable container with max height */}
      <div className="max-h-80 overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {expenses.map((expense: Expense) => (
            <li key={expense.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{expense.description}</p>
                  <p className="text-sm text-gray-500">{expense.category}</p>
                  <p className="text-sm text-gray-500">{expense.createdAt}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-red-600 font-semibold mr-4">
                    -${expense.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onDelete(expense.id)}
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

export default ExpenseList
