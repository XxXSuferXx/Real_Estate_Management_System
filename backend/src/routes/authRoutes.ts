import { Router } from 'express'
import { register, logout, login, refreshTokenHandler } from '../controllers/authController.js';
import { authRateLimiter } from '../middlewares/authRateLimiter.js';

const authRouter = Router();

authRouter.post("/register",authRateLimiter, register);

authRouter.post("/auth/login",authRateLimiter, login);

authRouter.post("/auth/refresh", refreshTokenHandler);

authRouter.get("/auth/logout", logout);

export default authRouter;