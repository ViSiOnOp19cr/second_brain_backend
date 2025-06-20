"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("./routes/User");
const Content_1 = require("./routes/Content");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/", User_1.UserRouter);
app.use("/", Content_1.Route);
app.listen(3000, () => {
    console.log("server running on port 3000");
});
