import { Router } from 'express'
import { register, logout } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post("/register", register);

authRouter.get("/logout", logout);

export default authRouter;