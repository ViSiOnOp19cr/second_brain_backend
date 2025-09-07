import { Request, Response, NextFunction } from 'express';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error: ' + err.message;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication failed: Invalid or expired token';
  } else if (err.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma specific errors
    statusCode = 400;
    
    if (err.code === 'P2002') {
      message = 'A record with this value already exists';
    } else if (err.code === 'P2025') {
      message = 'Record not found';
    }
  }

  // Differentiate between operational errors and programming/unknown errors
  const isProduction = process.env.NODE_ENV === 'production';
  
  const errorResponse = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(isProduction ? {} : { 
      stack: err.stack,
      error: err
    })
  };

  // Log error for debugging
  if (statusCode >= 500) {
    console.error('SERVER ERROR:', err);
  }

  return res.status(statusCode).json(errorResponse);
};

// Async handler to avoid try-catch blocks in controllers
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
