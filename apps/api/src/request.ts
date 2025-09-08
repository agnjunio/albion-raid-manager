import { APIErrorType, APIResponse } from "@albion-raid-manager/types/api";
import { Request, Response } from "express";
import { z } from "zod";

type ValidationOptions = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

export const validateRequest = (options: ValidationOptions) => {
  return async (req: Request, res: Response, next: Function) => {
    try {
      if (options.body) {
        const validatedBody = await options.body.parseAsync(req.body);
        req.body = validatedBody;
      }

      if (options.params) {
        const validatedPath = await options.params.parseAsync(req.params);
        req.params = validatedPath;
      }

      if (options.query) {
        const validatedQuery = await options.query.parseAsync(req.query);
        req.query = validatedQuery;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((error) => `${error.message}: ${error.path.join(".")}`).join(", ");
        res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, message));
      } else {
        next(error);
      }
    }
  };
};
