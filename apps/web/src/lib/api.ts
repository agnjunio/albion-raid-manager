import type { BaseQueryFn } from "@reduxjs/toolkit/query";

import { APIErrorType, APIResponse } from "@albion-raid-manager/types/api";
import axios, { isAxiosError, type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Utility function to redirect from server-specific routes to dashboard
function redirectToDashboard() {
  const currentPath = window.location.pathname;
  const isServerRoute =
    currentPath.startsWith("/dashboard/") && currentPath !== "/dashboard" && currentPath.split("/").length > 2;

  if (isServerRoute) {
    // Redirect to dashboard home (outside of server-specific routes)
    window.location.href = "/dashboard";
  }
}

// Shared function to handle specific error types that require dashboard redirection
function handleAPIErrorType(apiErrorType: APIErrorType) {
  if (apiErrorType === APIErrorType.NOT_SERVER_MEMBER || apiErrorType === APIErrorType.BOT_NOT_INSTALLED) {
    redirectToDashboard();
  }
}

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

    if ([403, 404].includes(error.response?.status || 0)) {
      const responseData = error.response?.data as APIResponse.Error;
      if (responseData?.type) {
        handleAPIErrorType(responseData.type);
      }
    }

    return Promise.reject(error);
  },
);

// Request connector for RTK Query
export const apiRTKRequest: BaseQueryFn<AxiosRequestConfig> = async (args) => {
  try {
    const response = await apiClient.request(args);
    const data = response.data as APIResponse.Type<unknown>;

    if (APIResponse.isError(data)) {
      handleAPIErrorType(data.type);
      throw new Error(data.type);
    }

    return { data: data.data };
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.data) {
        const data = error.response.data as APIResponse.Error;
        return { error: { status: error.response.status, data: data.type } };
      }
    }

    return { error: { status: 500, data: APIErrorType.UNKNOWN } };
  }
};

// Utils
export const isAPIError = (error: unknown): error is { status: number; data: APIErrorType } => {
  return typeof error === "object" && error !== null && "status" in error && "data" in error;
};

export const createTagHelper = <T extends "Raid" | "Guild" | "Composition" | "Item" | "Server">(tag: T) => ({
  list:
    (key: string) =>
    (response: unknown): { type: T; id: string }[] => {
      if (!response || typeof response !== "object" || !(key in response)) return [{ type: tag, id: "LIST" }];
      const items = (response as Record<string, Array<{ id: string | number }>>)[key];
      if (!Array.isArray(items)) return [{ type: tag, id: "LIST" }];
      return [...items.map(({ id }) => ({ type: tag, id: String(id) })), { type: tag, id: "LIST" }];
    },
  single:
    (key: string) =>
    (response: unknown): { type: T; id: string }[] => {
      if (!response || typeof response !== "object" || !(key in response)) return [];
      const item = (response as Record<string, { id: string | number }>)[key];
      if (!item || typeof item !== "object" || !("id" in item)) return [];
      return [{ type: tag, id: String(item.id) }];
    },
});
