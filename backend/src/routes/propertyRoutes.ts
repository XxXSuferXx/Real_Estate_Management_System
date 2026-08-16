import { Router } from "express";
import { searchRateLimiter, writeRateLimiter } from "../middlewares/authRateLimiter.js";
import { validate } from "../middlewares/validate.js";
import { createPropertySchema, searchPropertySchema } from "../validations/propertyValidaion.js";
import { restrictTo } from "../middlewares/rbacMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getPropertyById, addProperty, deleteProperty, searchPropertiesController } from "../controllers/propController.js";
import { UserRole } from "../common/constants/roles.js";

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
    searchPropertiesController              // Queries MongoDB using compound/text indexes
)

/**
 * @route   POST api/v1/properties/
 * @desc    Creates a new property listing
 * @access  Private (Agent, Admin)
 */
propRouter.post(
    "/",
    writeRateLimiter,                                       // Limits write requests (Redis)
    authMiddleware,                                         // Authenticate request by verifying JWT access token
    restrictTo(UserRole.ADMIN, UserRole.AGENT),             // Ensures only authorized personals can create listings
    validate(createPropertySchema),                         // Validates body payload (Zod)
    addProperty                                            // Handles property creation
)

propRouter.get("/:id", searchRateLimiter, getPropertyById);

/**
 * @route   POST api/v1/properties/:id
 * @desc    Deletes any property
 * @access  Private (Agent, Admin)
 */
propRouter.delete(
    "/:id",
    writeRateLimiter,
    authMiddleware,
    restrictTo(UserRole.AGENT, UserRole.ADMIN),
    deleteProperty
)

export default propRouter;