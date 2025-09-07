import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../utils/errorHandler';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("WARNING: JWT_SECRET is not defined in environment variables!");
}

interface UserRequest extends Request {
    userId?: number;
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const userMiddlewares = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        // Check if token is provided
        const token = req.headers.authorization;
        
        if (!token) {
            return next(new AppError('Authentication required. Please provide a token', 401));
        }
        
        // Check if JWT_SECRET is configured
        if (!JWT_SECRET) {
            return next(new AppError('Server configuration error', 500));
        }
        
        // Verify the token
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Token is valid but in wrong format
            if (typeof decoded === 'string') {
                return next(new AppError('Invalid token format', 401));
            }
            
            // Extract user ID from token
            const decodedObj = decoded as { id: string };
            req.userId = parseInt(decodedObj.id);
            
            next();
        } catch (tokenError: any) {
            // Handle specific JWT errors
            if (tokenError.name === 'TokenExpiredError') {
                return next(new AppError('Token has expired. Please log in again', 401));
            } else if (tokenError.name === 'JsonWebTokenError') {
                return next(new AppError('Invalid token. Please log in again', 401));
            }
            
            // For other token errors
            return next(new AppError('Authentication failed', 401));
        }
    } catch (error) {
        // Unexpected errors
        return next(new AppError('Authentication error', 500));
    }
};