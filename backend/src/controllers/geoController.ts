import type { Request, Response } from "express"
import { prefectures } from "../common/constants/prefectures.js"
import { resolveLabel } from "../common/utils/resolveLocalized.js"
import { AppError } from "../common/errors/appError.js";
import { cities } from "../common/constants/cities.js";

export const listPrefectures = async (req: Request, res: Response) => {
    const data = prefectures.map((p) => ({
        code: p.code,
        label: resolveLabel(p, req.locale)
    }));

    res.status(200).json({
        success: true,
        data
    });
}

export const listCitiesByPrefecture = async (req: Request, res: Response) => {
    const { prefectureCode } = req.params;

    const prefecture = prefectures.some((p) => p.code === prefectureCode);

    if(!prefecture) {
        throw new AppError("Prefecture not found", 404);
    }

    const data = cities
    .filter((c) => c.prefectureCode === prefectureCode)
    .map((c) => ({
        code: c.code,
        label: resolveLabel(c, req.locale)
    }));

    res.status(200).json({
        success: true,
        data,
    });
}