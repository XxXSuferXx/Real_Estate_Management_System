import "dotenv/config";

import app from './app.js';
import { connectDB } from "./config/db.js";
import "./jobs/translationWorker.js";
import { connectRedis } from "./config/redis.js";

const PORT = process.env.PORT;

if(!PORT) {
    console.error("PORT is missing in the enviornment variables");
    process.exit(1);
}

const startServer = async () => {
    try{
        await connectDB();
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch(error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};

startServer();