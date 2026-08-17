import { GoogleGenAI } from "@google/genai";
import { AppError } from "../errors/appError.js";

const apiKey = process.env.GENAI_KEY;

if(!apiKey) {
    throw new Error("Gemini API key is not defined")
}

const ai = new GoogleGenAI({ apiKey });

const MODEL = "gemini-3.5-flash-lite";

const Prompt = (text: string) =>
    [
        "Translate the following Japanese real estate listing text into natural, professional English.",
        "Output only the translated text. No preamble, no quotation marks, no notes, no explanation.",
        "Translate the full text- do not summarize or shorten it.",
        "",
        text
    ].join("\n");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(text: string, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: Prompt(text) }] }],
      });
 
      const translated = response.text?.trim();
      if (!translated) {
        throw new AppError("Gemini returned an empty translation", 502);
      }
      return translated;
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 ||
        String(error?.message ?? "").includes("RESOURCE_EXHAUSTED");
 
      if (isRateLimit && attempt < maxRetries) {
        await sleep(2 ** attempt * 1000);
        continue;
      }
 
      if (isRateLimit) {
        throw new AppError("Exceeded max retries for Gemini translation request", 429);
      }
      throw error;
    }
  }
  throw new AppError("Exceeded max retries for Gemini translation request", 429);
}
 

export const translateJpToEn = async (text: string) => {
  return generateWithRetry(text);
};