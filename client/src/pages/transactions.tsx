"use client"

import { useEffect, useState } from "react"
import type { Expense, Income } from "@/types"
import AddTransactionForm from "@/components/add-transaction-form"
import ExpenseList from "@/components/expense-list"
import IncomeList from "@/components/income-list"
import RootLayout from "@/layout"
import useIncome from "@/hooks/use-income"
import useExpense from "@/hooks/use-expense"
import type { TransactionFormValues } from "@/components/add-transaction-form"

export default function TransactionsPage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getIncomes, addIncome, deleteIncome } = useIncome()
  const { getExpenses, addExpense, deleteExpense } = useExpense()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [incomesData, expensesData] = await Promise.all([
        getIncomes(),
        getExpenses()
      ])
      setIncomes(incomesData.incomes)
      setExpenses(expensesData.expenses)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddTransaction = async (data: TransactionFormValues) => {
    try {
      if (data.type === "expense") {
        const expenseData = {
          amount: data.amount,
          category: data.category,
          description: data.description
        }
        await addExpense(expenseData)
      } else {
        const incomeData = {
          amount: data.amount,
          source: data.category,
          description: data.description
        }
        await addIncome(incomeData)
      }
      fetchData() // Refresh both lists
    } catch (error) {
      console.error('Failed to add transaction:', error)
    }
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncome(id)
      fetchData()
    } catch (error) {
      console.error('Failed to delete income:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id)
      fetchData()
    } catch (error) {
      console.error('Failed to delete expense:', error)
    }
  }

  return (
    <RootLayout>
      <div className="py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Transactions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Add Transaction</h3>
            <AddTransactionForm onSubmit={handleAddTransaction} />
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-semibold mb-2">Expenses</h4>
                <ExpenseList 
                  expenses={expenses} 
                  onDelete={handleDeleteExpense}
                  isLoading={isLoading}
                />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Incomes</h4>
                <IncomeList 
                  incomes={incomes} 
                  onDelete={handleDeleteIncome}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  )
}
