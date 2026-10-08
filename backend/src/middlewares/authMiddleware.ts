import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../common/constants/roles.js';
import { AppError } from '../common/errors/appError.js';

interface AccessTokenPayload extends jwt.JwtPayload {
  id: string;
  role: Role;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new AppError('Unauthorized: no token provided', 401);
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      throw new AppError('Invalid token', 401);
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error('ACCESS_TOKEN_SECRET is not defined in the environment variables');
    }
    const decoded = jwt.verify(token, secret) as AccessTokenPayload;

    req.user = { id: decoded.id, role: decoded.role };

    next();
  
};