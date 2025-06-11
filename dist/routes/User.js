"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes"
});
exports.UserRouter = express_1.default.Router();
exports.UserRouter.use(limiter);
exports.UserRouter.post("/signup", (req, res) => {
    (0, UserController_1.SignUp)(req, res);
});
exports.UserRouter.post("/login", (req, res) => {
    (0, UserController_1.Login)(req, res);
});
