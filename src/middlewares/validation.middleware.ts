import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { error } from '../utils/thrower';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => ({
          field: error.path.join('.'),
          message: error.message,
        }));
        error(res, 'Validation failed', 400, JSON.stringify(errorMessages));
        return;
      }
      error(res, 'Validation error', 400);
      return;
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => ({
          field: error.path.join('.'),
          message: error.message,
        }));
        error(res, 'Query validation failed', 400, JSON.stringify(errorMessages));
        return;
      }
      error(res, 'Query validation error', 400);
      return;
    }
  };
};
