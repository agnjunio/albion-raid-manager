export enum ServiceErrorCode {
  NOT_FOUND = "NOT_FOUND",
  INVALID_STATE = "INVALID_STATE",
}

export class ServiceError extends Error {
  code: ServiceErrorCode;
  message: string;

  constructor(code: ServiceErrorCode, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

export * from "./raid";
