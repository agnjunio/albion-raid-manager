import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { NextFunction, Request, Response } from "express";

export const requireAuth = (req: Request, res: Response<APIResponse.Type>, next: NextFunction) => {
  if (!req.session.accessToken) {
    return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
  }
  next();
};
