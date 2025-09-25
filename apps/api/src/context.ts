import { Redis } from "@albion-raid-manager/core/redis";
import { NextFunction, Request, Response } from "express";

/**
 *  Initialize context
 */
export const context = async (req: Request, _res: Response, next: NextFunction) => {
  req.context = {
    cache: Redis.getCache(),
  };

  next();
};
