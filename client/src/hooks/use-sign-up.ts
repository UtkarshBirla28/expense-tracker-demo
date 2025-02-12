import { useState } from "react";
import axios, { AxiosError } from "axios";
import { SignupFormValues } from "./../pages/auth/Sign-up";

interface SignUpResponse {
    message: string;
}

const useSignUp = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const signUp = async (data: SignupFormValues): Promise<SignUpResponse | void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post<SignUpResponse>(
        `${process.env.VITE_API_URL}/api/auth/signup`,
        {
          email: data.email,
          password: data.password
        }
      );
      setSuccess(true);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "Registration failed");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };
  return { signUp, loading, error, success };
};

export default useSignUp;
