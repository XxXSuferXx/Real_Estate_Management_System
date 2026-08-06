import { Router } from 'express'
import { register, logout, login, refreshTokenHandler } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post("/register", register);

authRouter.post("/auth/login", login);

authRouter.post("/refresh", refreshTokenHandler);

authRouter.get("/auth/logout", logout);

export default authRouter;