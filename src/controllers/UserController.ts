import express,{Request,Response} from 'express';
import { PrismaClient } from "../../generated/prisma";
import {z} from 'zod'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient();

//next apply zod.
//hash the passowrd.

const validation = z.object({
    username: z.string()
            .min(3,"username must be min 3 letters")
            .max(30,"username must be max 30 letters"),
    password: z.string()
            .min(8,"password must be min 8 letters")
            .max(30,"password must be max 30 letters")
})

export const SignUp = async(req:Request,res:Response)=>{
    const validateSignup = validation.safeParse(req.body);

    if(!validateSignup.success){
        return res.status(400).json({
            message:"Invalid input"
        })
    }
    const {username, password} = validateSignup.data;
    if(!username || !password){
        return res.status(400).json({error:"username and password are required"});
    }
    const salt = 12;
    const hash = await bcrypt.hash(password,salt);
    try{
    const user = await prisma.user.findUnique({
        where:{
            username: username
        }
    });
    if(user){
        return res.status(400).json({error:"user alredy exists"});
    }
    const newuser = await prisma.user.create({
        data:{
        username:username,
        password:hash
        }
    });
    return res.status(201).json({message:"user created succesfully"});
    }
    catch(e){
        return res.status(500).json({message:"something is fishy try again later."})
    }
}