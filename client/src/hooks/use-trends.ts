import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { TrendPoint } from "@/types";

interface TrendsResponse {
  trends: TrendPoint[];
}

const useTrends = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getTrends = async (): Promise<TrendsResponse | void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<TrendsResponse>(
        `${process.env.VITE_API_URL}/api/transactions/trends`
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { getTrends, isLoading, error };
};

export default useTrends;
