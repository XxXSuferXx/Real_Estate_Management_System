import { type Request, type Response, type NextFunction } from 'express';
import { UserRole } from '../common/constants/roles.js';
import { AppError } from '../common/errors/appError.js';
 
export const restrictTo =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };