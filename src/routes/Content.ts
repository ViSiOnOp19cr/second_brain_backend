import express from 'express';
import { userMiddlewares } from '../middlewares';

export const Route = express.Router();

Route.post('/content',userMiddlewares,(req,res)=>{

});

Route.get('/content', userMiddlewares, (req,res)=>{

});

Route.delete('/content',userMiddlewares,(req,res)=>{

});

Route.post('/sharebrain',userMiddlewares,(req,res)=>{

});