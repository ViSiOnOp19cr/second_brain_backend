"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../middlewares");
const ContentController_1 = require("../controllers/ContentController");
const validators_1 = require("../utils/validators");
exports.Route = express_1.default.Router();
// Content management routes with validation
exports.Route.post('/content', middlewares_1.userMiddlewares, (0, validators_1.validateRequest)(validators_1.contentSchema), ContentController_1.PostContent);
exports.Route.get('/content', middlewares_1.userMiddlewares, ContentController_1.getContent);
exports.Route.delete('/content/:id', middlewares_1.userMiddlewares, validators_1.validateIdParam, ContentController_1.deleteContent);
// Sharing routes with validation
exports.Route.post('/sharebrain', middlewares_1.userMiddlewares, ContentController_1.Sharebrain);
exports.Route.get('/share/:hash', validators_1.validateHashParam, ContentController_1.getsharebrain);
