"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.errorHandler = exports.AppError = void 0;
// Custom error class with status code
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong';
    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error: ' + err.message;
    }
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication failed: Invalid or expired token';
    }
    else if (err.name === 'PrismaClientKnownRequestError') {
        // Handle Prisma specific errors
        statusCode = 400;
        if (err.code === 'P2002') {
            message = 'A record with this value already exists';
        }
        else if (err.code === 'P2025') {
            message = 'Record not found';
        }
    }
    // Differentiate between operational errors and programming/unknown errors
    const isProduction = process.env.NODE_ENV === 'production';
    const errorResponse = Object.assign({ status: statusCode >= 500 ? 'error' : 'fail', message }, (isProduction ? {} : {
        stack: err.stack,
        error: err
    }));
    // Log error for debugging
    if (statusCode >= 500) {
        console.error('SERVER ERROR:', err);
    }
    return res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
// Async handler to avoid try-catch blocks in controllers
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
