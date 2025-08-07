import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import { error } from './thrower';

export interface PrismaErrorResponse {
  statusCode: number;
  message: string;
  shouldLog: boolean;
}

/**
 * Handles Prisma errors and returns appropriate HTTP responses
 */
export const handlePrismaError = (err: any): PrismaErrorResponse => {
  // Known Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return {
          statusCode: 409,
          message: 'A record with this information already exists.',
          shouldLog: false
        };

      case 'P2025':
        return {
          statusCode: 404,
          message: 'Record not found.',
          shouldLog: false
        };

      case 'P2023':
        // MongoDB ObjectID validation error
        return {
          statusCode: 400,
          message: 'Invalid ID format provided.',
          shouldLog: false
        };

      case 'P2003':
        return {
          statusCode: 400,
          message: 'Invalid reference to related record.',
          shouldLog: false
        };

      case 'P2021':
        return {
          statusCode: 404,
          message: 'Table or collection does not exist.',
          shouldLog: true
        };

      case 'P2024':
        return {
          statusCode: 408,
          message: 'Database operation timed out.',
          shouldLog: true
        };

      default:
        return {
          statusCode: 500,
          message: 'Database operation failed.',
          shouldLog: true
        };
    }
  }

  // Validation errors
  if (err instanceof PrismaClientValidationError) {
    return {
      statusCode: 400,
      message: 'Invalid data provided.',
      shouldLog: false
    };
  }

  // Unknown errors
  return {
    statusCode: 500,
    message: 'An unexpected error occurred.',
    shouldLog: true
  };
};

/**
 * Middleware-friendly error handler that sends HTTP response
 */
export const sendPrismaError = (res: Response, err: any): void => {
  const errorResponse = handlePrismaError(err);
  
  if (errorResponse.shouldLog) {
    console.error('Prisma Error:', {
      code: err.code || 'UNKNOWN',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }

  error(res, errorResponse.message, errorResponse.statusCode);
};

/**
 * Validates MongoDB ObjectID format
 */
export const isValidObjectId = (id: string): boolean => {
  // MongoDB ObjectID is 24 characters long and contains only hexadecimal characters
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validates multiple ObjectIDs
 */
export const areValidObjectIds = (ids: string[]): boolean => {
  return ids.every(id => isValidObjectId(id));
};

/**
 * Middleware to validate ObjectID parameters
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: any, res: Response, next: any): void => {
    const id = req.params[paramName];
    
    if (!id) {
      error(res, `${paramName} parameter is required`, 400);
      return;
    }

    if (!isValidObjectId(id)) {
      error(res, `Invalid ${paramName} format`, 400);
      return;
    }

    next();
  };
};
