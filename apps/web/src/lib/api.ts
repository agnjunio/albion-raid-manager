import { useCallback, useEffect, useRef, useState } from "react";

import { APIErrorType, type APIResponse } from "@albion-raid-manager/core/types/api";
import axios, { isAxiosError, type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

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

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const execute = useCallback(
    async (requestConfig?: AxiosRequestConfig) => {
      // Skip if there's an ongoing request
      if (abortControllerRef.current) {
        return;
      }

      const currentRequestId = ++requestIdRef.current;
      abortControllerRef.current = new AbortController();

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await apiClient.request<APIResponse.Type<T>>({
          ...config,
          ...requestConfig,
          signal: abortControllerRef.current.signal,
        });

        // Skip if this request was superseded
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (response.data.success) {
          const data = response.data.data;
          setState({ data, isLoading: false, error: null });
          return data;
        } else if (!response.data.success) {
          const { error } = response.data;
          setState((prev) => ({ ...prev, isLoading: false, error }));
        }
      } catch (error) {
        // Skip if this request was superseded
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (axios.isCancel(error)) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Handle network errors
        if (isAxiosError(error)) {
          if (!error.response) {
            setState((prev) => ({ ...prev, isLoading: false, error: APIErrorType.UNKNOWN }));
            return;
          }

          const apiError = error.response.data as APIResponse.Error;
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: apiError.error,
          }));
          return;
        }

        setState((prev) => ({ ...prev, isLoading: false, error: APIErrorType.UNKNOWN }));
      } finally {
        // Only clear the AbortController if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          abortControllerRef.current = null;
        }
      }
    },
    [config],
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    requestIdRef.current = 0;
    setState({ data: undefined, isLoading: false, error: null });
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (autoExecute) {
      execute();
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
