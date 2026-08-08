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
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      prefix: 'rl:',
    }),
    handler: (req, res, next) => {
      next(new AppError(message, 429));
    },
  });

export const authRateLimiter = buildLimiter(
  15 * 60 * 1000, 
  10,
  'Too many attempts. Please try again in 15 minutes.'
);