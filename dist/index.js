"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get('/', (req, res) => {
    res.send("hi baby what sup what ru doing how us your life going then whats up all good ??");
});
app.listen(3000, () => {
    console.log("server running on port 3000");
});
