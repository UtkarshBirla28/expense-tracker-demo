import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Income } from "@/types";

interface IncomeResponse {
  incomes: Income[];
  message: string;
}

interface AddIncomeData {
  amount: number;
  source: string;
  description: string;
}

const useIncome = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const getIncomes = async (): Promise<IncomeResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<IncomeResponse>(
        `${process.env.VITE_API_URL}/api/transactions/income`
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addIncome = async (transaction: AddIncomeData): Promise<Income> => {
    setIsAdding(true);
    setAddError(null);
    try {
      const response = await axiosInstance.post<{ income: Income; message: string }>(
        `${process.env.VITE_API_URL}/api/transactions/income/add`,
        {
          amount: transaction.amount,
          source: transaction.source,
          description: transaction.description,
        }
      );
      return response.data.income;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setAddError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const deleteIncome = async (id: string): Promise<void> => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await axiosInstance.delete(
        `${process.env.VITE_API_URL}/api/transactions/deleteIncome/${id}`
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setDeleteError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    getIncomes,
    addIncome,
    deleteIncome,
    isLoading,
    error,
    isAdding,
    addError,
    isDeleting,
    deleteError,
  };
};

export default useIncome;
