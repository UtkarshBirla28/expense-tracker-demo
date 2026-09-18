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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record what comes in and what goes out.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <div className="lg:sticky lg:top-8 lg:col-span-2">
          <AddTransactionForm onSubmit={handleAddTransaction} />
        </div>
        <div className="space-y-6 lg:col-span-3">
          <ExpenseList
            expenses={expenses}
            onDelete={handleDeleteExpense}
            isLoading={isLoading}
          />
          <IncomeList
            incomes={incomes}
            onDelete={handleDeleteIncome}
            isLoading={isLoading}
          />
        </div>
      </div>
    </RootLayout>
  )
}
