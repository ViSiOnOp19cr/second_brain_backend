"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("./routes/User");
const Content_1 = require("./routes/Content");
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./utils/errorHandler");
const app = (0, express_1.default)();
// Request logger middleware for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
    methods: "*",
    preflightContinue: false
}));
// Routes
app.use("/", User_1.UserRouter);
app.use("/", Content_1.Route);
// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Cannot ${req.method} ${req.path}`
    });
});
// Global error handler (must be last)
app.use(errorHandler_1.errorHandler);
// Uncaught exception handler
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});
// Unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
    process.exit(1);
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
