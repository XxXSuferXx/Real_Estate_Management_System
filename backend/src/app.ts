import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes.js";
import propRouter from "./routes/propertyRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/',authRouter);
app.use('api/v1/properties',propRouter)

app.get("/health", (req: Request, res: Response)=> {

    const isDbConnected = mongoose.connection.readyState === 1;

    const healthStatus = {
        status: isDbConnected? "healthy": "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
            server: "up",
            database: isDbConnected? "connected": "disconnected"
        }
    };

    return res.status(isDbConnected ? 200 : 503).json(healthStatus);
})

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;