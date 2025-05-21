import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { Request, Response } from "express";
import { z } from "zod";

export const validateRequest = <T extends z.ZodType>(schema: T) => {
  return async (req: Request<{}, {}, z.infer<T>>, res: Response, next: Function) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, error.errors[0].message));
      } else {
        next(error);
      }
    }
  };
};
