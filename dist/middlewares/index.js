"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddlewares = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("../utils/errorHandler");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("WARNING: JWT_SECRET is not defined in environment variables!");
}
/**
 * Authentication middleware to verify JWT tokens
 */
const userMiddlewares = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if token is provided
        const token = req.headers.authorization;
        if (!token) {
            return next(new errorHandler_1.AppError('Authentication required. Please provide a token', 401));
        }
        // Check if JWT_SECRET is configured
        if (!JWT_SECRET) {
            return next(new errorHandler_1.AppError('Server configuration error', 500));
        }
        // Verify the token
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Token is valid but in wrong format
            if (typeof decoded === 'string') {
                return next(new errorHandler_1.AppError('Invalid token format', 401));
            }
            // Extract user ID from token
            const decodedObj = decoded;
            req.userId = parseInt(decodedObj.id);
            next();
        }
        catch (tokenError) {
            // Handle specific JWT errors
            if (tokenError.name === 'TokenExpiredError') {
                return next(new errorHandler_1.AppError('Token has expired. Please log in again', 401));
            }
            else if (tokenError.name === 'JsonWebTokenError') {
                return next(new errorHandler_1.AppError('Invalid token. Please log in again', 401));
            }
            // For other token errors
            return next(new errorHandler_1.AppError('Authentication failed', 401));
        }
    }
    catch (error) {
        // Unexpected errors
        return next(new errorHandler_1.AppError('Authentication error', 500));
    }
});
exports.userMiddlewares = userMiddlewares;
