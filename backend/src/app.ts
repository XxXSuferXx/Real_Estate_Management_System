import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { redisClient } from "./config/redis.js";
import authRouter from "./routes/authRoutes.js";
import propRouter from "./routes/propertyRoutes.js";
import { AppError } from "./common/errors/appError.js";
import { errorHandler } from "./middlewares/error.js";
import geoRouter from "./routes/geoRoutes.js";
import { localeMiddleware } from "./middlewares/locale.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', authRouter);
app.use('/api/v1/properties', propRouter)
app.use('/api/v1/geo', geoRouter);
app.use(localeMiddleware);

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

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

app.use(errorHandler);

export default app;