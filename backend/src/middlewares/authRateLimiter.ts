import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';
import { AppError } from '../common/errors/appError.js';

const buildLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => 
        redisClient.sendCommand(args),
      prefix: 'rl:',
    }),
    handler: (req, res, next) => {
      next(new AppError(message, 429));
    }
  });

// Rate limits auth routes (Login, Register, Refresh)
export const authRateLimiter = buildLimiter(
  15 * 60 * 1000, 
  2000,
  'Too many attempts. Please try again in 15 minutes.'
);

// Rate limits property routes (create/update property, upload images)
export const writeRateLimiter = buildLimiter(
  60 * 1000,
  200,
  'Too many requests. Please try again after waiting some time.'
);

// Rate limits propert search end points
export const searchRateLimiter = buildLimiter(
  60 * 1000,
  300,
  'Too many requests. Please try again after some time.'
);