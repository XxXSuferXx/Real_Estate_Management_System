import { type Request, type Response, type NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../common/errors/appError.js';

export const validate =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // Change as any to better approach
      req.validated = schema.parse({ body: req.body, query: req.query, params: req.params }) as any;
      
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        return next(new AppError(message, 400));
      }
      next(err);
    }
  };