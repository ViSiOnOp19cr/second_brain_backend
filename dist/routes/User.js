"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const validators_1 = require("../utils/validators");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiting middleware
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per window
    message: {
        status: 'error',
        message: "Too many requests from this IP, please try again after 15 minutes"
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
exports.UserRouter = express_1.default.Router();
exports.UserRouter.use(limiter);
// Auth routes with validation
exports.UserRouter.post("/signup", (0, validators_1.validateRequest)(validators_1.userSchema), UserController_1.SignUp);
exports.UserRouter.post("/login", (0, validators_1.validateRequest)(validators_1.userSchema), UserController_1.Login);
