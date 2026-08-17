import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/errors/appError.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Access token expired';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate field: ${Object.keys(err.keyValue).join(', ')}`;
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e: any) => e.message)
      .join(', ');
  }

  const isKnownError = err instanceof AppError || statusCode < 500;

  if (!isKnownError) {
    console.error('UNEXPECTED ERROR', err);
  }

  res.status(statusCode).json({
    success: false,
    message: isKnownError ? message : 'Something went wrong. Please try again.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};