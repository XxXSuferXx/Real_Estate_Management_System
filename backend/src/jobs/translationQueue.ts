import { Queue } from "bullmq";
import { queueConnection } from "./queueConnection.js";

export interface TranslationJobData{
    propertyId: string;
}

export const translationQueue = new Queue<TranslationJobData>("translation", {
    connection: queueConnection
});
