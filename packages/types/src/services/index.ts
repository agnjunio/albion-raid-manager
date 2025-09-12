export enum ServiceErrorCode {
  NOT_AUTHORIZED = "NOT_AUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  INVALID_STATE = "INVALID_STATE",
  CREATE_FAILED = "CREATE_FAILED",
}

export class ServiceError extends Error {
  code: ServiceErrorCode;
  message: string;

  constructor(code: ServiceErrorCode, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }

  static isServiceError(error: unknown): error is ServiceError {
    return error instanceof ServiceError;
  }
}

export * from "./build";
export * from "./raid";
