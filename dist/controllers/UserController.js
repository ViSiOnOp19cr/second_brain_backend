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
exports.Login = exports.SignUp = void 0;
const prisma_1 = require("../../generated/prisma");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("../utils/errorHandler");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("WARNING: JWT_SECRET is not defined in environment variables!");
}
const prisma = new prisma_1.PrismaClient();
// Input validation schema using zod
const userSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters"),
    password: zod_1.z.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must be at most 30 characters")
});
// Sign up controller with improved error handling
exports.SignUp = (0, errorHandler_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // The request body has already been validated by middleware
    const { username, password } = req.body;
    // Check if user exists
    const existingUser = yield prisma.user.findUnique({
        where: { username }
    });
    if (existingUser) {
        throw new errorHandler_1.AppError('User with this username already exists', 409);
    }
    // Hash password and create user
    const salt = 12;
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    yield prisma.user.create({
        data: {
            username,
            password: hashedPassword
        }
    });
    res.status(201).json({
        status: 'success',
        message: 'User created successfully'
    });
}));
// Login controller with improved error handling
exports.Login = (0, errorHandler_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // The request body has already been validated by middleware
    const { username, password } = req.body;
    // Find user
    const user = yield prisma.user.findUnique({
        where: { username }
    });
    if (!user) {
        throw new errorHandler_1.AppError('Invalid username or password', 401);
    }
    // Check password
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new errorHandler_1.AppError('Invalid username or password', 401);
    }
    if (!JWT_SECRET) {
        throw new errorHandler_1.AppError('Server configuration error', 500);
    }
    // Generate token
    const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        token
    });
}));
