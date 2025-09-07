import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from "../../generated/prisma";
import { random } from '../utils';
import { z } from 'zod'; 
import { AppError, catchAsync } from '../utils/errorHandler';

const prisma = new PrismaClient();

interface CustomRequest extends Request {
    userId?: number;
}

// Validation schema for creating content
const contentSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.string().min(1, "Type is required"),
    link: z.string().url("Link must be a valid URL"),
    tags: z.array(z.string()).min(1, "At least one tag is required")
});

// Create content controller
export const PostContent = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    
    if (!userId) {
        throw new AppError('Authentication required', 401);
    }

    // The request body has already been validated by the middleware
    const { title, type, link, tags } = req.body;
    
    // Process tags
    const tagRecords = await Promise.all(
        tags.map(async (tagTitle: string) => {
            const existingTag = await prisma.tags.findFirst({
                where: {
                    title: tagTitle,
                    userId
                }
            });
            
            if (existingTag) return existingTag;
            
            return await prisma.tags.create({
                data: {
                    title: tagTitle,
                    user: {
                        connect: { id: userId }
                    }
                }
            });
        })
    );
    
    // Create content
    const newContent = await prisma.content.create({
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
});

// Get content controller
export const getContent = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    
    if (!userId) {
        throw new AppError('Authentication required', 401);
    }
    
    // Fetch content
    const content = await prisma.content.findMany({
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
});

// Delete content controller
export const deleteContent = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    
    if (!userId) {
        throw new AppError('Authentication required', 401);
    }
    
    // Content ID has already been validated and parsed by the middleware
    const contentId = req.params.id as unknown as number;
    
    // Verify ownership
    const content = await prisma.content.findUnique({
        where: { id: contentId }
    });
    
    if (!content) {
        throw new AppError('Content not found', 404);
    }
    
    if (content.userId !== userId) {
        throw new AppError('You are not authorized to delete this content', 403);
    }

    // Delete content tags
    await prisma.contentTags.deleteMany({
        where: { contentId },
    });
    
    // Delete content
    await prisma.content.delete({
        where: { id: contentId },
    });
    
    res.status(200).json({
        status: 'success',
        message: 'Content deleted successfully'
    });
});

// Share brain controller
export const Sharebrain = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    
    if (!userId) {
        throw new AppError('Authentication required', 401);
    }
    
    const share = req.body;
    
    if (share && Object.keys(share).length > 0) {
        // Check if share link already exists
        const existingLink = await prisma.link.findUnique({
            where: { userId },
        });

        if (existingLink) {
            return res.status(200).json({
                status: 'success', 
                hash: existingLink.hash 
            });
        }

        // Create new hash and save it
        const hash = random(10);
        await prisma.link.create({
            data: {
                userId,
                hash,
            },
        });

        res.status(200).json({
            status: 'success',
            hash
        });
    } else {
        // Remove existing share link
        await prisma.link.deleteMany({
            where: { userId },
        });

        res.status(200).json({ 
            status: 'success',
            message: 'Share link removed'
        });
    }
});

// Get shared brain content
export const getsharebrain = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    // Hash has already been validated by the middleware
    const { hash } = req.params;

    // Find link by hash
    const link = await prisma.link.findUnique({
        where: { hash }
    });

    if (!link) {
        throw new AppError('Invalid share link', 404);
    }

    const userId = link.userId;

    // Fetch content for the user
    const content = await prisma.content.findMany({
        where: { userId },
        include: {
            tags: {
                include: { tag: true }
            }
        }
    });

    // Fetch user details
    const userRecord = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!userRecord) {
        throw new AppError('User not found', 404);
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
});