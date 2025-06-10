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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUp = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const SignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    console.log(username, password);
    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: {
                username: username
            }
        });
        console.log(user);
        if (user) {
            return res.status(400).json({ error: "user alredy exists" });
        }
        const newuser = yield prisma.user.create({
            data: {
                username: username,
                password: password
            }
        });
        return res.status(201).json({ message: "user created succesfully" });
    }
    catch (e) {
        return res.status(400).json({ message: "something is fishy try again later." });
    }
});
exports.SignUp = SignUp;
