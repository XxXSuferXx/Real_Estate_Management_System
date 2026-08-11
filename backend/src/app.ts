import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { redisClient } from "./config/redis.js";
import authRouter from "./routes/authRoutes.js";
import propRouter from "./routes/propertyRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/',authRouter);
app.use('/api/v1/properties/',propRouter)

app.get("/health", async (req: Request, res: Response)=> {

    const isDbConnected = mongoose.connection.readyState === 1;
    let isRedisConnected = false;
    try {
        if(redisClient.isOpen){
            const ping = await redisClient.ping();
            isRedisConnected = ping === "PONG";
        }
    } catch {
        isRedisConnected = false;
    }

    const isHealthy = isDbConnected && isRedisConnected;

    return res.status(isHealthy ? 200 : 503).json({
        status: isHealthy? "healthy": "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
            server: "up",
            database: isDbConnected? "connected": "disconnected",
            redis: isRedisConnected? "connected": "disconnected"
        }
    });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;