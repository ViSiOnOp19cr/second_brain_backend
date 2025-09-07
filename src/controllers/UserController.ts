import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from "../../generated/prisma";
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError, catchAsync } from '../utils/errorHandler';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("WARNING: JWT_SECRET is not defined in environment variables!");
}

const prisma = new PrismaClient();

// Input validation schema using zod
const userSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must be at most 30 characters")
});

// Sign up controller with improved error handling
export const SignUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // The request body has already been validated by middleware
    const { username, password } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { username }
    });

    if (existingUser) {
        throw new AppError('User with this username already exists', 409);
    }

    // Hash password and create user
    const salt = 12;
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await prisma.user.create({
        data: {
            username,
            password: hashedPassword
        }
    });

    res.status(201).json({
        status: 'success',
        message: 'User created successfully'
    });
});

// Login controller with improved error handling
export const Login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // The request body has already been validated by middleware
    const { username, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
        where: { username }
    });

    if (!user) {
        throw new AppError('Invalid username or password', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
        throw new AppError('Invalid username or password', 401);
    }

    if (!JWT_SECRET) {
        throw new AppError('Server configuration error', 500);
    }

    // Generate token
    const token = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        token
    });
});