import express from 'express';
import { userMiddlewares } from '../middlewares';
import { PostContent, getContent, deleteContent, Sharebrain, getsharebrain } from '../controllers/ContentController';
import { validateRequest, validateIdParam, validateHashParam, contentSchema } from '../utils/validators';

export const Route = express.Router();

// Content management routes with validation
Route.post(
  '/content', 
  userMiddlewares, 
  validateRequest(contentSchema),
  PostContent
);

Route.get('/content', userMiddlewares, getContent);

Route.delete(
  '/content/:id', 
  userMiddlewares, 
  validateIdParam,
  deleteContent
);

// Sharing routes with validation
Route.post('/sharebrain', userMiddlewares, Sharebrain);

Route.get(
  '/share/:hash', 
  validateHashParam,
  getsharebrain
);