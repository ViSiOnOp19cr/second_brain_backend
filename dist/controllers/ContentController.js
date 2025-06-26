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
exports.getsharebrain = exports.Sharebrain = exports.deleteContent = exports.getContent = exports.PostContent = void 0;
const prisma_1 = require("../../generated/prisma");
const utils_1 = require("../utils");
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
                link,
                user: {
                    connect: { id: userId }
                },
                tags: {
                    create: tagRecords.map((tag) => ({
                        tag: { connect: { id: tag.id } }
                    }))
                }
            },
            include: {
                tags: { include: { tag: true } },
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
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const content = yield prisma.content.findMany({
        where: {
            userId: userId
        },
        include: {
            tags: {
                include: { tag: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    const formatted = content.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        link: c.link,
        tags: c.tags.map((t) => t.tag.title),
        createdAt: c.createdAt
    }));
    return res.status(200).json({
        message: "succesfully fetched the contents",
        formatted
    });
});
exports.getContent = getContent;
const deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = parseInt(req.params.id);
    if (isNaN(contentId)) {
        return res.status(400).json({ message: "invalid id" });
    }
    try {
        //delete the tags of content
        yield prisma.contentTags.deleteMany({
            where: { contentId },
        });
        //delete the contents
        yield prisma.content.delete({
            where: { id: contentId },
        });
    }
    catch (error) {
        return res.status(500).json({ message: "something is fishy" });
    }
});
exports.deleteContent = deleteContent;
const Sharebrain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const share = req.body;
        const userId = req.userId;
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized: No userId' });
        }
        if (share && Object.keys(share).length > 0) {
            // Check if a share link already exists for the user
            const existingLink = yield prisma.link.findUnique({
                where: {
                    userId: req.userId,
                },
            });
            if (existingLink) {
                res.json({ hash: existingLink.hash });
                return;
            }
            // Create new hash and save it
            const hash = (0, utils_1.random)(10);
            yield prisma.link.create({
                data: {
                    userId: req.userId,
                    hash,
                },
            });
            res.json({ hash });
        }
        else {
            yield prisma.link.deleteMany({
                where: {
                    userId: req.userId,
                },
            });
            res.json({ message: 'removed link' });
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'something went wrong' });
    }
});
exports.Sharebrain = Sharebrain;
const getsharebrain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hash } = req.params;
        // 1. Find link by hash
        const link = yield prisma.link.findUnique({
            where: { hash }
        });
        if (!link) {
            return res.status(404).json({
                message: "Invalid share link"
            });
        }
        const userId = link.userId;
        // 2. Fetch content for the user
        const content = yield prisma.content.findMany({
            where: { userId }
        });
        // 3. Fetch user details
        const userRecord = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (!userRecord) {
            return res.status(404).json({ message: "User not found" });
        }
        // 4. Respond
        return res.json({
            username: userRecord.username,
            content
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "something went wrong"
        });
    }
});
exports.getsharebrain = getsharebrain;
