import { Worker, type Job } from "bullmq";
import { queueConnection } from "./queueConnection.js";
import { translateJpToEn } from "../common/utils/translate.js";
import { Property } from "../Modals/propertySchema.js";
import type { TranslationJobData } from "./translationQueue.js";

export const translationWorker = new Worker<TranslationJobData>(
  "translation",
  async (job: Job<TranslationJobData>) => {
    const property = await Property.findById(job.data.propertyId);

    if (!property) return;

    if (
      property.translationStatus.title === "human" &&
      property.translationStatus.description === "human"
    ) {
      return;
    }

    const [titleEn, descriptionEn] = await Promise.all([
      translateJpToEn(property.title.ja),
      translateJpToEn(property.description.ja),
    ]);

    property.title.en = titleEn;
    property.description.en = descriptionEn;
    property.translationStatus.title = "machine";
    property.translationStatus.description = "machine";

    await property.save();
  },
  { connection: queueConnection }
);

translationWorker.on("failed", (job, err) => {
  console.error(`Translation job ${job?.id} failed:`, err.message);
});