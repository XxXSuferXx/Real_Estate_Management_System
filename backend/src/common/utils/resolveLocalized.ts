import type { Locale } from "../constants/locale.js";

export interface Localized {
  code: string;
  ja: string;
  en: string;
}

export const resolveLabel = (entry: Localized, locale: Locale) =>
  locale === "en" ? entry.en : entry.ja;