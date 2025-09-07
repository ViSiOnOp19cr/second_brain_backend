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
const zod_1 = require("zod");
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new prisma_1.PrismaClient();
// Validation schema for creating content
const contentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    type: zod_1.z.string().min(1, "Type is required"),
    link: zod_1.z.string().url("Link must be a valid URL"),
    tags: zod_1.z.array(zod_1.z.string()).min(1, "At least one tag is required")
});
// Create content controller
exports.PostContent = (0, errorHandler_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        throw new errorHandler_1.AppError('Authentication required', 401);
    }
    // The request body has already been validated by the middleware
    const { title, type, link, tags } = req.body;
    // Process tags
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
                    connect: { id: userId }
                }
            }
        });
    })));
    // Create content
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
    res.status(201).json({
        status: 'success',
        message: 'Content created successfully',
        data: newContent
    });
}));
// Get content controller
exports.getContent = (0, errorHandler_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        throw new errorHandler_1.AppError('Authentication required', 401);
    }
    // Fetch content
    const content = yield prisma.content.findMany({
        where: { userId },
        include: {
            tags: {
                include: { tag: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    // Format response
    const formatted = content.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        link: c.link,
        tags: c.tags.map((t) => t.tag.title),
        createdAt: c.createdAt
    }));
    res.status(200).json({
        status: 'success',
        message: 'Content retrieved successfully',
        data: formatted
    });
}));
// Delete content controller
exports.deleteContent = (0, errorHandler_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        throw new errorHandler_1.AppError('Authentication required', 401);
    }
    // Content ID has already been validated and parsed by the middleware
    const contentId = req.params.id;
    // Verify ownership
    const content = yield prisma.content.findUnique({
        where: { id: contentId }
    });
    if (!content) {
        throw new errorHandler_1.AppError('Content not found', 404);
    }
    if (content.userId !== userId) {
        throw new errorHandler_1.AppError('You are not authorized to delete this content', 403);
    }
    // Delete content tags
    yield prisma.contentTags.deleteMany({
        where: { contentId },
    });
    // Delete content
    yield prisma.content.delete({
        where: { id: contentId },
    });
    res.status(200).json({
        status: 'success',
        message: 'Content deleted successfully'
    });
}));
// Share brain controller
exports.Sharebrain = (0, errorHandler_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        throw new errorHandler_1.AppError('Authentication required', 401);
    }
    const share = req.body;
    if (share && Object.keys(share).length > 0) {
        // Check if share link already exists
        const existingLink = yield prisma.link.findUnique({
            where: { userId },
        });
        if (existingLink) {
            return res.status(200).json({
                status: 'success',
                hash: existingLink.hash
            });
        }
        // Create new hash and save it
        const hash = (0, utils_1.random)(10);
        yield prisma.link.create({
            data: {
                userId,
                hash,
            },
        });
        res.status(200).json({
            status: 'success',
            hash
        });
    }
    else {
        // Remove existing share link
        yield prisma.link.deleteMany({
            where: { userId },
        });
        res.status(200).json({
            status: 'success',
            message: 'Share link removed'
        });
    }
}));
// Get shared brain content
exports.getsharebrain = (0, errorHandler_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Hash has already been validated by the middleware
    const { hash } = req.params;
    // Find link by hash
    const link = yield prisma.link.findUnique({
        where: { hash }
    });
    if (!link) {
        throw new errorHandler_1.AppError('Invalid share link', 404);
    }
    const userId = link.userId;
    // Fetch content for the user
    const content = yield prisma.content.findMany({
        where: { userId },
        include: {
            tags: {
                include: { tag: true }
            }
        }
    });
    // Fetch user details
    const userRecord = yield prisma.user.findUnique({
        where: { id: userId }
    });
    if (!userRecord) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // Format response
    const formatted = content.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        link: c.link,
        tags: c.tags.map((t) => t.tag.title),
        createdAt: c.createdAt
    }));
    res.status(200).json({
        status: 'success',
        username: userRecord.username,
        data: formatted
    });
}));
