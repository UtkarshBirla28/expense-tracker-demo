import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useState } from "react";

const useSummary = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const getSummary = async (): Promise<any | void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await axiosInstance.get<any>(
        `${process.env.VITE_API_URL}/api/transactions/summary`
      );
      setSuccess(true);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "Failed to fetch summary");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return { getSummary, loading, error, success };
};

export default useSummary;