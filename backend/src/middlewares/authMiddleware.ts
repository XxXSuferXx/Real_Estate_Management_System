import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { type UserRole } from '../common/constants/roles.js';
import { AppError } from '../common/errors/appError.js';

interface AccessTokenPayload extends jwt.JwtPayload {
  id: string;
  role: UserRole;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    return next();
  } catch (error){

    if (error instanceof AppError) {
      return next(error);
    }
    // Access token expired
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Unauthorized: Access token expired', 401));
    }

    // Invalid token
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Unauthorized: Invalid or tampered token', 401));
    }
    return next(error);
  }
};