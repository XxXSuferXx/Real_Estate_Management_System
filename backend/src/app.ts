import express from "express";
import type { Request, Response } from "express";
import authRouter from "./routes/authRoutes.js";

const app = express();
app.use(express.json());
app.use('/api/v1/',authRouter);

app.get("/health", (req: Request, res: Response)=> {

})

app.listen(3000, ()=>{
    console.log("Server is running on Port 3000")
})
