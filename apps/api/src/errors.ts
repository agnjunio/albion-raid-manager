import { logger } from "@albion-raid-manager/core/logger";
import { APIErrorType, APIResponse } from "@albion-raid-manager/types/api";
import { NextFunction, Request, Response } from "express";

export const errors = (error: Error, req: Request, res: Response, _next: NextFunction) => {
  const message = error.message || "Internal Server Error";

  logger.error("API Error:", {
    message: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
  });

  // If the error is an APIResponse, return the error
  if (APIResponse.isError(error)) {
    res.status(400).json(error);
    return;
  }

  res.status(500).json({
    success: false,
    type: APIErrorType.INTERNAL_SERVER_ERROR,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export const errorThrower = () => {
  throw new Error("Test error");
};
