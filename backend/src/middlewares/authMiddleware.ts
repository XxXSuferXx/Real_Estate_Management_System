import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { type UserRole } from '../Modals/userSchema.js';
import { AppError } from '../common/errors/appError.js';

interface AccessTokenPayload extends jwt.JwtPayload {
  id: string;
  role: UserRole | string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw new AppError('Unauthorized: no token provided', 401);
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!token) {
    throw new AppError('Invalid token', 400);
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined in the environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret) as AccessTokenPayload;

    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch {
    throw new AppError('Forbidden: invalid or expired token', 403);
  }
};