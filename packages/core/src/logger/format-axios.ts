import { AxiosError } from "axios";
import winston from "winston";

class FilteredAxiosError extends Error {
  code?: string;
  status?: number;
  statusText?: string;
  url?: string;
  method?: string;
  timeout?: number;
  responseData?: unknown;
  headers?: Record<string, unknown>;

  constructor(error: AxiosError) {
    super(error.message);
    this.code = error.code;
    this.status = error.response?.status;
    this.statusText = error.response?.statusText;
    this.url = error.config?.url;
    this.method = error.config?.method?.toUpperCase();
    this.timeout = error.config?.timeout;
    this.stack = error.stack;
  }
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

  // Create a filtered version of the error as a plain object
  const filteredError = new FilteredAxiosError(axiosError);

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
 * This format automatically filters axios errors in the error property
 */
export const formatAxios = winston.format((info) => {
  // Filter axios errors in the error object
  if (info.error && (info.error as Record<string, unknown>).isAxiosError) {
    info.error = filterAxiosError(info.error);
  }

  return info;
});
