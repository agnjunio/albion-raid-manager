interface APISuccess<T> {
  success: true;
  data?: T;
}

interface APIError {
  success: false;
  error: APIErrorType;
}

export enum APIErrorType {
  NOT_AUTHORIZED = "NOT_AUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SESSION_EXPIRED = "SESSION_EXPIRED",
}

export namespace APIResponse {
  export type Type<T = any> = APISuccess<T> | APIError;

  export function Success<T = any>(data?: T): APISuccess<T> {
    return { success: true, data };
  }

  export function Error(error: APIErrorType): APIError {
    return { success: false, error };
  }
}
