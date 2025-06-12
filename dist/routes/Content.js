"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../middlewares");
const ContentController_1 = require("../controllers/ContentController");
exports.Route = express_1.default.Router();
exports.Route.post('/content', middlewares_1.userMiddlewares, (req, res) => {
    (0, ContentController_1.PostContent)(req, res);
});
exports.Route.get('/content', middlewares_1.userMiddlewares, (req, res) => {
    (0, ContentController_1.getContent)(req, res);
});
exports.Route.delete('/content', middlewares_1.userMiddlewares, (req, res) => {
});
exports.Route.post('/sharebrain', middlewares_1.userMiddlewares, (req, res) => {
});
