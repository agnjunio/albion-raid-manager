import type { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";

import { useCallback, useEffect, useRef, useState } from "react";

import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Internal client - not exported
const apiClient = axios.create({
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

export interface UseApiState<T> {
  data?: T;
  isLoading: boolean;
  error: AxiosError | APIErrorType | null;
}

export interface UseApiResult<T> extends UseApiState<T> {
  execute: (config?: AxiosRequestConfig) => Promise<T | undefined>;
  reset: () => void;
}

interface UseApiOptions extends AxiosRequestConfig {
  autoExecute?: boolean;
}

/**
 * A React hook for making API requests with built-in loading and error state management.
 * This is the recommended way to make API calls in the application.
 *
 * @example
 * ```tsx
 * // Auto-execute on mount
 * const { data, isLoading, error } = useApi<UserData>({
 *   method: 'GET',
 *   url: '/api/user',
 *   autoExecute: true
 * });
 *
 * // Manual execution
 * const { data, isLoading, error, execute } = useApi<UserData>({
 *   method: 'GET',
 *   url: '/api/user'
 * });
 *
 * // Execute manually
 * const handleSubmit = async () => {
 *   await execute({
 *     method: 'POST',
 *     data: formData
 *   });
 * };
 * ```
 */
export function useApi<T = unknown>(options: UseApiOptions = {}): UseApiResult<T> {
  const { autoExecute, ...config } = options;
  const [state, setState] = useState<UseApiState<T>>({
    isLoading: false,
    error: null,
  });

  // Use a ref to track if we've executed in Strict Mode
  const hasExecutedRef = useRef(false);
  // Use a ref to store the mount execution promise
  const mountPromiseRef = useRef<Promise<T | undefined>>(undefined);

  const execute = useCallback(
    async (requestConfig?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await apiClient.request<APIResponse.Type<T>>({
          ...config,
          ...requestConfig,
        });

        if (response.data.success) {
          const data = response.data.data;
          setState({ data, isLoading: false, error: null });
          return data;
        } else if (!response.data.success) {
          const { error } = response.data;
          setState((prev) => ({ ...prev, isLoading: false, error }));
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        setState((prev) => ({ ...prev, isLoading: false, error: axiosError }));
      }
    },
    [config],
  );

  const reset = useCallback(() => {
    setState({ data: undefined, isLoading: false, error: null });
    hasExecutedRef.current = false;
    mountPromiseRef.current = undefined;
  }, []);

  useEffect(() => {
    if (autoExecute && !hasExecutedRef.current) {
      hasExecutedRef.current = true;
      // Store the promise so we can handle Strict Mode double-mounting
      mountPromiseRef.current = execute();
    }
  }, [autoExecute, execute]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Export a type for the API client in case it's needed for type definitions
export type ApiClient = typeof apiClient;
