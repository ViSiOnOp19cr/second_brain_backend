import express from 'express';
import { userMiddlewares } from '../middlewares';
import { PostContent,getContent,deleteContent,Sharebrain,getsharebrain } from '../controllers/ContentController';
export const Route = express.Router();

Route.post('/content',userMiddlewares,(req,res)=>{
    PostContent(req,res);
});

Route.get('/content', userMiddlewares, (req,res)=>{
    getContent(req,res)
});

Route.delete('/content/:id',userMiddlewares,(req,res)=>{
    deleteContent(req,res);
});

Route.post('/sharebrain',userMiddlewares,(req,res)=>{
    Sharebrain(req,res);
});
Route.get('./share/:hash',userMiddlewares,(req,res)=>{
    getsharebrain(req,res);
})