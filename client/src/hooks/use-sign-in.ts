import { useState } from "react";
import { SigninFormValues } from "../pages/auth/Sign-in";
import axios, { AxiosError } from "axios";
import storage from "../utils/storage";

interface SignInResponse {
    token: string;
    message: string;
}

const useSignIn = () => {
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [onSuccess, setOnSuccess] = useState<boolean>(false);

    const signIn = async (data: SigninFormValues): Promise<SignInResponse | void> => {
        setLoading(true);
        setError("");
        setOnSuccess(false);
        try {
             const response = await axios.post<SignInResponse>(
                `${process.env.VITE_API_URL}/api/auth/signin`,
                {
                    email: data.email,
                    password: data.password
                }
            );
            setOnSuccess(true);
            console.log(response.data.token);
            storage.setUserData(response.data.token);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data?.message || "Authentication failed");
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    }

    return { signIn, loading, error, onSuccess };
}

export default useSignIn;