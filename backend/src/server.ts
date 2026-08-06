import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

if(!MONGO_URI || !PORT) {
    console.error("Mongo URI is missing in the enviornment variables");
    process.exit(1);
}

const startServer = async () => {
    try{
        await mongoose.connect(MONGO_URI)
        console.log("Connected to Mongo DB");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch(error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};

startServer();