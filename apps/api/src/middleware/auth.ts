import { APIError, APIErrorType } from "@/types/error";
import { NextFunction, Request, Response } from "express";

export const requireAuth = (req: Request, res: Response<APIError>, next: NextFunction) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: APIErrorType.NOT_AUTHORIZED });
  }
  next();
};
