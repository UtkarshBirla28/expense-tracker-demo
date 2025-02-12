import { useState } from "react"
import axiosInstance from "../utils/axiosInstance"
import { Expense } from "@/types"

interface ExpenseResponse {
    expenses: Expense[]
    message: string
}

interface AddExpenseData {
    amount: number
    category: string
    description: string
}

const useExpenses = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const [isAdding, setIsAdding] = useState<boolean>(false)
    const [addError, setAddError] = useState<string | null>(null)

    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const getExpenses = async (): Promise<ExpenseResponse> => {
        setIsLoading(true)
        setError(null)
        try { 
              const response = await axiosInstance.get<ExpenseResponse>(
                `${process.env.VITE_API_URL}/api/transactions/expense`
              );
              return response.data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
            setError(errorMessage)
            throw new Error(errorMessage)
        }
        finally {
            setIsLoading(false)
        }
    }

    const addExpense = async (transaction: AddExpenseData): Promise<Expense> => {
      setIsAdding(true);
      setAddError(null);
      try {
          const response = await axiosInstance.post<{ expense: Expense; message: string }>(
              `${process.env.VITE_API_URL}/api/transactions/expense/add`,
              {
                  amount: transaction.amount,
                  category: transaction.category,
                  description: transaction.description
              }
          )
          return response.data.expense;
      } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
          setAddError(errorMessage);
          throw new Error(errorMessage)
      } finally {
          setIsAdding(false);
      }
    }

    const deleteExpense = async (id: string): Promise<void> => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
          const response = await axiosInstance.delete(
            `${process.env.VITE_API_URL}/api/transactions/deleteExpense/${id}`
          );
          return response.data;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
          setDeleteError(errorMessage);
          throw new Error(errorMessage)
        } finally {
          setIsDeleting(false);
        }
    }
    return { getExpenses,addExpense,deleteExpense, isLoading, error,isAdding, addError, isDeleting, deleteError }
}

export default useExpenses;