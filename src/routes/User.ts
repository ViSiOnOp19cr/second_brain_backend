import express from 'express'
import { Login, SignUp } from '../controllers/UserController'
import { validateRequest, userSchema } from '../utils/validators';
import rateLimit from 'express-rate-limit';

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { 
    status: 'error', 
    message: "Too many requests from this IP, please try again after 15 minutes" 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const UserRouter = express.Router();
UserRouter.use(limiter);

// Auth routes with validation
UserRouter.post(
  "/signup", 
  validateRequest(userSchema),
  SignUp
);

UserRouter.post(
  "/login", 
  validateRequest(userSchema),
  Login
);

