import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

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
  data: T | null;
  isLoading: boolean;
  error: AxiosError | null;
}

export interface UseApiResult<T> extends UseApiState<T> {
  execute: (config?: AxiosRequestConfig) => Promise<T>;
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
export function useApi<T = any>(options: UseApiOptions = {}): UseApiResult<T> {
  const { autoExecute, ...config } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  // Use a ref to track if we've executed in Strict Mode
  const hasExecutedRef = useRef(false);
  // Use a ref to store the mount execution promise
  const mountPromiseRef = useRef<Promise<T> | null>(null);

  const execute = useCallback(
    async (requestConfig?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await apiClient.request<T>({
          ...config,
          ...requestConfig,
        });
        setState({ data: response.data, isLoading: false, error: null });
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        setState((prev) => ({ ...prev, isLoading: false, error: axiosError }));
        throw axiosError;
      }
    },
    [config],
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
    hasExecutedRef.current = false;
    mountPromiseRef.current = null;
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
