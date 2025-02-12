import axiosInstance from "@/utils/axiosInstance";
import { useState } from "react";
import { AxiosError } from "axios";

const usePdfDownload = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = async (): Promise<Blob | void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `${process.env.VITE_API_URL}/api/pdf/export`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.message || "Failed to download PDF");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return { downloadPdf, isLoading, error };
};

export default usePdfDownload;
