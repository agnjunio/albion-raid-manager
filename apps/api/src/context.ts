import { NextFunction, Request, Response } from "express";

/**
 *  Initialize context
 */
export const context = async (req: Request, _res: Response, next: NextFunction) => {
  req.context = {
    cache: undefined, // Caching disabled for now
  };

  next();
};
