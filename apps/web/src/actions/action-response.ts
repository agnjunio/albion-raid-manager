export interface SuccessResponse<T> {
  success: true;
  data?: T;
}

export interface FailureResponse {
  success: false;
  error: string;
}

export class ActionResponse {
  static Success<T>(data?: T): SuccessResponse<T> {
    return { success: true, data };
  }

  static Failure(error: string): FailureResponse {
    return { success: false, error };
  }
}
