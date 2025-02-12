import axios from "axios";
import storage from "@/utils/storage";

const axiosInstance = axios.create({
  baseURL: process.env.VITE_API_URL, 
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.getUserData()?.token; // Get token from storage
    console.log(token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
