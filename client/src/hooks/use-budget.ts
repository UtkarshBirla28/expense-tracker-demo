import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Budget } from "@/types";

interface BudgetResponse {
  budgets: Budget[];
}

interface SaveBudgetData {
  category: string;
  amount: number;
}

const useBudget = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const getBudgets = async (): Promise<BudgetResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<BudgetResponse>(
        `${process.env.VITE_API_URL}/api/budgets`
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBudget = async (budget: SaveBudgetData): Promise<Budget> => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await axiosInstance.post<{ budget: Budget; message: string }>(
        `${process.env.VITE_API_URL}/api/budgets`,
        budget
      );
      return response.data.budget;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setSaveError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBudget = async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${process.env.VITE_API_URL}/api/budgets/${id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  return { getBudgets, saveBudget, deleteBudget, isLoading, error, isSaving, saveError };
};

export default useBudget;
