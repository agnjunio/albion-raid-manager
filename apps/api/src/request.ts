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
        Object.assign(req.body, validatedBody);
      }

      if (options.params) {
        const validatedPath = await options.params.parseAsync(req.params);
        Object.assign(req.params, validatedPath);
      }

      if (options.query) {
        const validatedQuery = await options.query.parseAsync(req.query);
        Object.assign(req.query, validatedQuery);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues.map((issue) => `${issue.message}: ${issue.path.join(".")}`).join(", ");
        res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, message));
      } else {
        next(error);
      }
    }
  };
};
