import express from 'express'
import {SignUp} from '../controllers/UserController'

import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: "Too many requests from this IP, please try again after 15 minutes"
});

export const UserRouter = express.Router();
UserRouter.use(limiter);

UserRouter.post("/signup", (req,res) => { 
    SignUp(req,res);
});

