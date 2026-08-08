import { Router } from 'express'

// Middlewares
import { authRateLimiter } from '../middlewares/authRateLimiter.js';
import { validate } from '../middlewares/validate.js';

// Validation Schemas
import { registerSchema, loginSchema } from '../validations/authValidation.js';

// Controllers
import { register, logout, login, refreshTokenHandler } from '../controllers/authController.js';

const authRouter = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
authRouter.post(
    "/auth/register",
    authRateLimiter,                // Prevent brute-force spam (Redis)
    validate(registerSchema),       // Validate body & password strength (Zod)
    register                        // Run database logic & issue JWT
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
authRouter.post(
    "/auth/login",
    authRateLimiter,               // Prevent brute-force spam (Redis)
    validate(loginSchema),         // Validate body & email/password format (Zod)
    login                          // Verifies password hash, issues JWT access/refresh tokens & responds
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Issue a new access token using a valid refresh token
 * @access  Public (Token-guarded)
 */
authRouter.post(
    "/auth/refresh",
    authRateLimiter,               // Prevents end point hammering & automated token generation spam
    refreshTokenHandler            // Verifies refresh token signature/Redis whitelist & returns new Access token
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Invalidate user session & clear authentication cookies
 * @access  Private / Authenticated
 */
authRouter.get(
    "/auth/logout",
    logout                        // Revokes active refresh token in Redis & clears HTTP-only auth cookies
);

export default authRouter;