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
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new prisma_1.PrismaClient();
//next apply zod.
//hash the passowrd.
const validation = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, "username must be min 3 letters")
        .max(30, "username must be max 30 letters"),
    password: zod_1.z.string()
        .min(8, "password must be min 8 letters")
        .max(30, "password must be max 30 letters")
});
const SignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSignup = validation.safeParse(req.body);
    if (!validateSignup.success) {
        return res.status(400).json({
            message: "Invalid input"
        });
    }
    const { username, password } = validateSignup.data;
    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }
    const salt = 12;
    const hash = yield bcrypt_1.default.hash(password, salt);
    try {
        const user = yield prisma.user.findUnique({
            where: {
                username: username
            }
        });
        if (user) {
            return res.status(400).json({ error: "user alredy exists" });
        }
        const newuser = yield prisma.user.create({
            data: {
                username: username,
                password: hash
            }
        });
        return res.status(201).json({ message: "user created succesfully" });
    }
    catch (e) {
        return res.status(500).json({ message: "something is fishy try again later." });
    }
});
exports.SignUp = SignUp;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Loginvalidation = validation.safeParse(req.body);
        if (!Loginvalidation.success) {
            return res.status(400).json({
                message: "invalid input form"
            });
        }
        const { username, password } = Loginvalidation.data;
        if (!username || !password) {
            return res.status(400).json({ error: "username and password are required" });
        }
        const user = yield prisma.user.findUnique({
            where: {
                username: username
            }
        });
        if (!user) {
            return res.status(400).json({
                message: "username doesnt exist"
            });
        }
        const hashedpassword = yield bcrypt_1.default.compare(password, user.password);
        if (!hashedpassword) {
            return res.status(400).json({
                message: "invalid password"
            });
        }
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment");
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET);
        return res.status(201).json({
            message: "logged in successfully",
            token: token
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "somthing seems to be fishy"
        });
    }
});
exports.Login = Login;
