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
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const userMiddlewares = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers.authorization;
        if (!token) {
            res.status(401).send({
                message: 'unauthorized'
            });
            return;
        }
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment");
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded) {
            if (typeof decoded === 'string') {
                res.status(403).json({
                    message: "Not logged in"
                });
                return;
            }
            req.userId = decoded.id;
            next();
        }
    }
    catch (e) {
        res.status(500).json({
            message: "auth failed"
        });
    }
});
exports.userMiddlewares = userMiddlewares;
