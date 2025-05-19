import type { SerializedError } from "@reduxjs/toolkit";

import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import axios, { isAxiosError, type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Internal client - not exported
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

// Request connector for RTK Query
export const apiRTKRequest = async (args: AxiosRequestConfig): Promise<{ data: unknown; error?: SerializedError }> => {
  try {
    const response = await apiClient.request(args);
    const data = response.data as APIResponse.Type<unknown>;
    if (APIResponse.isError(data)) {
      throw new Error(data.type);
    }

    return { data: data.data };
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.data) {
        const data = error.response.data as APIResponse.Error;
        return { data: error.response.data, error: { message: data.type } };
      }
    }

    return { data: undefined, error: { message: APIErrorType.UNKNOWN } };
  }
};
