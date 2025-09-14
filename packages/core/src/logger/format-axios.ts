import { AxiosError } from "axios";
import winston from "winston";

interface FilteredAxiosError {
  name: string;
  message: string;
  code?: string;
  status?: number;
  statusText?: string;
  url?: string;
  method?: string;
  timeout?: number;
  responseData?: unknown;
  headers?: Record<string, unknown>;
}

/**
 * Filters and sanitizes axios errors to reduce log bloat
 * while preserving important information for debugging
 */
function filterAxiosError(error: unknown): unknown {
  if (!error || typeof error !== "object") {
    return error;
  }

  // If it's not an axios error, return as-is
  if (!(error as Record<string, unknown>).isAxiosError) {
    return error;
  }

  const axiosError = error as AxiosError;

  // Create a filtered version of the error
  const filteredError: FilteredAxiosError = {
    name: axiosError.name,
    message: axiosError.message,
    code: axiosError.code,
    status: axiosError.response?.status,
    statusText: axiosError.response?.statusText,
    url: axiosError.config?.url,
    method: axiosError.config?.method?.toUpperCase(),
    timeout: axiosError.config?.timeout,
  };

  // Only include response data for specific status codes that might be useful
  const usefulStatusCodes = [400, 401, 403, 404, 422, 429, 500, 502, 503, 504];
  if (axiosError.response?.status && usefulStatusCodes.includes(axiosError.response.status)) {
    // Include response data for useful status codes, but limit its size
    const responseData = axiosError.response.data;
    if (responseData && typeof responseData === "object") {
      filteredError.responseData =
        JSON.stringify(responseData).length > 500
          ? JSON.stringify(responseData).substring(0, 500) + "..."
          : responseData;
    }
  }

  // Include headers only for specific cases (like rate limiting)
  if (axiosError.response?.status === 429) {
    filteredError.headers = {
      "retry-after": axiosError.response.headers["retry-after"],
      "x-ratelimit-limit": axiosError.response.headers["x-ratelimit-limit"],
      "x-ratelimit-remaining": axiosError.response.headers["x-ratelimit-remaining"],
      "x-ratelimit-reset": axiosError.response.headers["x-ratelimit-reset"],
    };
  }

  return filteredError;
}

/**
 * Winston format for filtering axios errors
 * This format automatically filters axios errors in log messages
 */
export const formatAxios = winston.format((info) => {
  // Filter axios errors in the error object
  if (info.error) {
    info.error = filterAxiosError(info.error);
  }

  // Filter axios errors in the message if it's an object
  if (info.message && typeof info.message === "object") {
    info.message = filterAxiosError(info.message);
  }

  return info;
});
