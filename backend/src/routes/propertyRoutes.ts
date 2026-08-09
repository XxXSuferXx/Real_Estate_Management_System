import { Router } from "express";
import { searchRateLimiter, writeRateLimiter } from "../middlewares/authRateLimiter.js";
import { validate } from "../middlewares/validate.js";
import { createPropertySchema, searchPropertySchema } from "../validations/propertyValidaion.js";
import { restrictTo } from "../middlewares/rbacMiddleware.js";

const propRouter = Router();

/**
 * @route   GET api/v1/properties/search
 * @desc    Search and filter property listing using query parameters
 * @access  Public
 */
propRouter.get(
    "/search",
    searchRateLimiter,                      // Prevents search scraping & DB Load (Redis)
    validate(searchPropertySchema),         // Validates query params like price, filters & pagination (Zod)
    propertyController                      // Queries MongoDB using compound/text indexes
)

/**
 * @route   POST api/v1/properties
 * @desc    Creates a new property listing with multilingual details and GeoJSON coordinates
 * @access  Private (Agent, Admin)
 */
propRouter.post(
    "/",
    writeRateLimiter,                       // Limits write requests (Redis)
    authMiddleware,                         // Authenticate request by verifying JWT access token
    restrictTo('agent', 'admin'),           // Ensures only authorized personals can create listings
    validate(createPropertySchema),         // Validates body payload (Zod)
    propertyController                      // Handles property creation
)

export default propRouter;