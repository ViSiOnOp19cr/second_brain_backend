import {Request,Response} from 'express';
import { PrismaClient } from "../../generated/prisma";
import { random } from '../utils'; 

const prisma = new PrismaClient();
interface CustomRequest extends Request{
    userId?:number
}


export const PostContent = async(req:CustomRequest,res:Response)=>{
    const { title, type, link, tags }: { title: string; type: string; link: string; tags: string[] } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!title || !type || !link || !Array.isArray(tags)) {
        return res.status(400).json({ message: "Invalid input" });
    }
    try{
        
        const tagRecords = await Promise.all(
            tags.map(async(tagTitle)=>{
                const existingTag = await prisma.tags.findFirst({
                    where:{
                        title:tagTitle,
                        userId
                    }
                });
                if(existingTag) return existingTag;
                return await prisma.tags.create({
                    data:{
                        title:tagTitle,
                        user:{
                            connect:{
                                    id:userId 
                                }
                        }
                    }
                });
            })
        );
        const newContent = await prisma.content.create({
            data:{
                title,
                type,
                link,
                user:{
                    connect:{id:userId}},
                
                tags:{
                    create:tagRecords.map((tag)=>({
                    tag:{connect:{id:tag.id}}}))
            }
            },
            include:{
                tags: { include: { tag: true } },
            }
        });
    
    return res.status(201).json({
        message: "Content posted successfully",
        data: newContent,
    });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }

}
export const getContent = async(req:CustomRequest,res:Response)=>{
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    const content = await prisma.content.findMany({
        where: {
            userId: userId
        },
        include:{
            tags:{
                include:{tag:true}
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
        message:"succesfully fetched the contents",
        formatted
    });
}
export const deleteContent = async(req:CustomRequest,res:Response)=>{
    const contentId = parseInt(req.params.id);
    if(isNaN(contentId)){
        return res.status(400).json({message:"invalid id"});
    }
    try{
        //delete the tags of content
        await prisma.contentTags.deleteMany({
            where:{contentId},
        });
        
        //delete the contents
        await prisma.content.delete({
            where: { id: contentId },
          });
    }catch(error){
        return res.status(500).json({message:"something is fishy"});
    }
}
export const Sharebrain = async(req:CustomRequest,res:Response)=>{
    try{
    const share = req.body;
    const userId = req.userId;
    if (!req.userId) {
        return res.status(401).json({ message: 'Unauthorized: No userId' });
    }
    if (share && Object.keys(share).length > 0) {
      // Check if a share link already exists for the user
      const existingLink = await prisma.link.findUnique({
        where: {
          userId:req.userId,
        },
      });

      if (existingLink) {
        res.json({ hash: existingLink.hash });
        return;
      }

      // Create new hash and save it
      const hash = random(10);
      await prisma.link.create({
        data: {
            userId: req.userId,
            hash,
        },
      });

      res.json({ hash });
    } else {
      await prisma.link.deleteMany({
        where: {
          userId: req.userId!,
        },
      });

      res.json({ message: 'removed link' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'something went wrong' });
  }

};

export const getsharebrain=async(req:CustomRequest,res:Response)=>{
    try{
        const { hash } = req.params;

    // 1. Find link by hash
    const link = await prisma.link.findUnique({
      where: { hash }
    });

    if (!link) {
      return res.status(404).json({
        message: "Invalid share link"
      });
    }

    const userId = link.userId;

    // 2. Fetch content for the user
    const content = await prisma.content.findMany({
      where: { userId }
    });

    // 3. Fetch user details
    const userRecord = await prisma.user.findUnique({
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
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "something went wrong"
    });
  }
}