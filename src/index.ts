import express, { json } from 'express';
import { UserRouter } from './routes/User';
import { Route } from './routes/Content';

const app = express();

app.use(express.json())
app.use("/", UserRouter);
app.use("/",Route);
app.listen(3000,()=>{
    console.log("server running on port 3000")
})