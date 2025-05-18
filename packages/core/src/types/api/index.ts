export enum APIErrorType {
  NOT_AUTHORIZED = "NOT_AUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  UNKNOWN = "UNKNOWN",
}

export namespace APIResponse {
  export interface Error {
    success: false;
    type: APIErrorType;
    message?: string;
  }

  export interface Success<T = unknown> {
    success: true;
    data: T;
  }

  export type Type<T = unknown> = Success<T> | Error;

  export function Success<T = unknown>(data: T): Success<T> {
    return { success: true, data };
  }

  export function Error(type: APIErrorType, message?: string): Error {
    return { success: false, type, message };
  }

  export function isError(response: unknown): response is Error {
    return typeof response === "object" && response !== null && "success" in response && response.success === false;
  }
}
