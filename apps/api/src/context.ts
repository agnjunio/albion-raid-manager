import { NextFunction, Request, Response } from "express";

export const context = (req: Request, _res: Response, next: NextFunction) => {
  req.context = req.context || {};
  next();
};
