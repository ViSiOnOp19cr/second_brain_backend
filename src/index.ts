import express, { json } from 'express';
import { UserRouter } from './routes/User';


const app = express();

app.use(express.json())
app.use("/", UserRouter);

app.listen(3000,()=>{
    console.log("server running on port 3000")
})