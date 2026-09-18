import { useEffect, useState } from "react"
import type { Expense, Income } from "@/types"
import AddTransactionForm from "@/components/add-transaction-form"
import ExpenseList from "@/components/expense-list"
import IncomeList from "@/components/income-list"
import RootLayout from "@/layout"
import useIncome from "@/hooks/use-income"
import useExpense from "@/hooks/use-expense"
import type { TransactionFormValues, EditingTransaction } from "@/components/add-transaction-form"
import type { TransactionRow } from "@/components/transaction-list"
import { useToast } from "@/components/toast"

export default function TransactionsPage() {
  const { toast } = useToast()
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<EditingTransaction | null>(null)
  const { getIncomes, addIncome, updateIncome, deleteIncome } = useIncome()
  const { getExpenses, addExpense, updateExpense, deleteExpense } = useExpense()

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
        if (editing) {
          await updateExpense(editing.id, expenseData)
        } else {
          await addExpense(expenseData)
        }
      } else {
        const incomeData = {
          amount: data.amount,
          source: data.category,
          description: data.description
        }
        if (editing) {
          await updateIncome(editing.id, incomeData)
        } else {
          await addIncome(incomeData)
        }
      }
      toast(
        editing
          ? "Transaction updated"
          : data.type === "expense"
            ? "Expense added"
            : "Income added"
      )
      setEditing(null)
      fetchData() // Refresh both lists
    } catch (error) {
      toast("Could not save transaction", "error")
      console.error('Failed to save transaction:', error)
    }
  }

  const startEditing = (type: "expense" | "income") => (row: TransactionRow) => {
    setEditing({
      id: row.id,
      values: {
        type,
        amount: row.amount,
        category: row.tag,
        description: row.description,
      },
    })
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncome(id)
      toast("Income deleted")
      fetchData()
    } catch (error) {
      toast("Could not delete income", "error")
      console.error('Failed to delete income:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id)
      toast("Expense deleted")
      fetchData()
    } catch (error) {
      toast("Could not delete expense", "error")
      console.error('Failed to delete expense:', error)
    }
  }

  return (
    <RootLayout>
      <div className="animate-rise">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record what comes in and what goes out.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <div className="animate-rise lg:sticky lg:top-8 lg:col-span-2" style={{ animationDelay: "100ms" }}>
          <AddTransactionForm
            onSubmit={handleAddTransaction}
            editing={editing}
            onCancelEdit={() => setEditing(null)}
          />
        </div>
        <div className="animate-rise space-y-6 lg:col-span-3" style={{ animationDelay: "180ms" }}>
          <ExpenseList
            expenses={expenses}
            onDelete={handleDeleteExpense}
            onEdit={startEditing("expense")}
            isLoading={isLoading}
          />
          <IncomeList
            incomes={incomes}
            onDelete={handleDeleteIncome}
            onEdit={startEditing("income")}
            isLoading={isLoading}
          />
        </div>
      </div>
    </RootLayout>
  )
}
