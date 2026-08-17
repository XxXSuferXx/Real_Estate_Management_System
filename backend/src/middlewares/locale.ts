import type { Request, Response, NextFunction } from "express";
import { DEFAULT_LOCALE, type Locale } from "../common/constants/locale.js";

export const localeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const lang = req.query.lang;

  if (lang === "en" || lang === "ja") {
    req.locale = lang;
    return next();
  }
  // Not a real RFC 4647 parser, if japanese is preferred more, would fail to detect correct language
  const acceptLanguage = String(req.headers["accept-language"] ?? "");
  req.locale = acceptLanguage.toLowerCase().startsWith("en") ? "en" : DEFAULT_LOCALE;

  next();
};

export type { Locale };