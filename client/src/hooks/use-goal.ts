import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Goal } from "@/types";

interface GoalResponse {
  goals: Goal[];
}

interface AddGoalData {
  name: string;
  targetAmount: number;
}

const useGoal = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const getGoals = async (): Promise<GoalResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<GoalResponse>(
        `${process.env.VITE_API_URL}/api/goals`
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

  const addGoal = async (goal: AddGoalData): Promise<Goal> => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await axiosInstance.post<{ goal: Goal; message: string }>(
        `${process.env.VITE_API_URL}/api/goals`,
        goal
      );
      return response.data.goal;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setSaveError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const contributeToGoal = async (id: number, amount: number): Promise<Goal> => {
    try {
      const response = await axiosInstance.patch<{ goal: Goal; message: string }>(
        `${process.env.VITE_API_URL}/api/goals/${id}/contribute`,
        { amount }
      );
      return response.data.goal;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  const deleteGoal = async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${process.env.VITE_API_URL}/api/goals/${id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  return { getGoals, addGoal, contributeToGoal, deleteGoal, isLoading, error, isSaving, saveError };
};

export default useGoal;
