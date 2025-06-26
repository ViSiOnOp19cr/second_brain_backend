import express, { json } from 'express';
import { UserRouter } from './routes/User';
import { Route } from './routes/Content';
import cors from 'cors';
const app = express();

app.use(express.json());
app.use(cors())
app.use("/", UserRouter);
app.use("/",Route);
app.listen(3000,()=>{
    console.log("server running on port 3000")
})