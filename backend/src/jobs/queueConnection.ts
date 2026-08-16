import { Redis } from "ioredis";

const redis_url = process.env.REDIS_URL;

if(!redis_url) {
    throw new Error("Redis URL not found");
}

export const queueConnection = new Redis(redis_url, {
    maxRetriesPerRequest: null
});
