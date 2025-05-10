import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    const noRedirect = ["/", "/auth/callback"];
    if (error.response?.status === 401 && !noRedirect.includes(window.location.pathname)) {
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);
