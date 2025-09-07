import express, { json, Request, Response, NextFunction } from 'express';
import { UserRouter } from './routes/User';
import { Route } from './routes/Content';
import cors from 'cors';
import { errorHandler } from './utils/errorHandler';

const app = express();

// Request logger middleware for debugging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(cors({
    origin:"*",
    methods:"*",
    preflightContinue:false
}));

// Routes
app.use("/", UserRouter);
app.use("/", Route);

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    status: 'fail', 
    message: `Cannot ${req.method} ${req.path}` 
  });
});

// Global error handler (must be last)
app.use(errorHandler as any);

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  process.exit(1);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});