import { Router } from "express";
import { searchRateLimiter } from "../middlewares/authRateLimiter.js";
import { listCitiesByPrefecture, listPrefectures } from "../controllers/geoController.js";
import { localeMiddleware } from "../middlewares/locale.js";

const geoRouter = Router();

geoRouter.get("/prefectures", searchRateLimiter, localeMiddleware, listPrefectures);



geoRouter.get("/prefectures/:prefectureCode/cities", searchRateLimiter, localeMiddleware, listCitiesByPrefecture);

export default geoRouter;