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
exports.getContent = exports.PostContent = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const PostContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, type, link, tags } = req.body;
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    if (!title || !type || !link || !Array.isArray(tags)) {
        return res.status(400).json({ message: "Invalid input" });
    }
    try {
        let existingLink = yield prisma.link.findUnique({ where: { hash: link } });
        if (!existingLink) {
            existingLink = yield prisma.link.create({
                data: {
                    hash: link,
                    url: link,
                    user: { connect: { id: userId } },
                },
            });
        }
        const tagRecords = yield Promise.all(tags.map((tagTitle) => __awaiter(void 0, void 0, void 0, function* () {
            const existingTag = yield prisma.tags.findFirst({
                where: {
                    title: tagTitle,
                    userId
                }
            });
            if (existingTag)
                return existingTag;
            return yield prisma.tags.create({
                data: {
                    title: tagTitle,
                    user: {
                        connect: {
                            id: userId
                        }
                    }
                }
            });
        })));
        const newContent = yield prisma.content.create({
            data: {
                title,
                type,
                user: { connect: { id: userId } },
                link: { connect: { id: existingLink.id } },
                tags: {
                    create: tagRecords.map((tag) => ({
                        tag: { connect: { id: tag.id } }
                    }))
                }
            },
            include: {
                tags: { include: { tag: true } },
                link: true,
            }
        });
        return res.status(201).json({
            message: "Content posted successfully",
            data: newContent,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});
exports.PostContent = PostContent;
const getContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield prisma.content.findMany({
        include: {
            link: true,
            tags: {
                include: { tag: true }
            }
        }
    });
    const formatted = content.map((c) => {
        var _a;
        return ({
            id: c.id,
            title: c.title,
            type: c.type,
            link: (_a = c.link) === null || _a === void 0 ? void 0 : _a.url,
            tags: c.tags.map((t) => t.tag.title),
        });
    });
    return res.status(200).json({
        message: "succesfully fetched the contents",
        formatted
    });
});
exports.getContent = getContent;
