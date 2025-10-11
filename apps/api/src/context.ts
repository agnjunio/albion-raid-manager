import { Redis } from "@albion-raid-manager/core/redis";
import { NextFunction, Request, Response } from "express";

export const context = async (req: Request, _res: Response, next: NextFunction) => {
  req.context = {
    cache: Redis.getCache(),
  };

  next();
};
