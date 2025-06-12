import {Request,Response} from 'express';
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();
interface CustomRequest extends Request{
    userId?:number
}
interface content{
    link:string,
    title:string,
    type:"document" | "tweet" | "youtube" | "link",
    tags:[]

}

export const PostContent = async(req:CustomRequest,res:Response)=>{
    const { title, type, link, tags }: { title: string; type: string; link: string; tags: string[] } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!title || !type || !link || !Array.isArray(tags)) {
        return res.status(400).json({ message: "Invalid input" });
    }
    try{
        let existingLink = await prisma.link.findUnique({ where: { hash: link } });
        if (!existingLink) {
            existingLink = await prisma.link.create({
                data: {
                hash:link,
                url: link,
                user: { connect: { id: userId } },
            },
        });
    }
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
                user:{connect:{id:userId}},
                link:{connect:{id:existingLink.id}},
                tags:{
                    create:tagRecords.map((tag)=>({
                    tag:{connect:{id:tag.id}}}))
            }
            },
            include:{
                tags: { include: { tag: true } },
                link: true,
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
    const content = await prisma.content.findMany({
        include:{
            link:true,
            tags:{
                include:{tag:true}
            }
        }
    });
    const formatted = content.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        link: c.link?.url, 
        tags: c.tags.map((t) => t.tag.title), 
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