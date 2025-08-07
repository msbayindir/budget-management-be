import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/thrower';

export interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return error(res, message, statusCode, err.stack);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return error(res, `Route ${req.originalUrl} not found`, 404);
};
