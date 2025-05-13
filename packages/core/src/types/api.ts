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
  export interface Success<T> {
    success: true;
    data?: T;
  }

  export interface Error {
    success: false;
    error: APIErrorType;
  }

  export type Type<T = unknown> = Success<T> | Error;

  export function Success<T = unknown>(data?: T): Success<T> {
    return { success: true, data };
  }

  export function Error(error: APIErrorType): Error {
    return { success: false, error };
  }
}
