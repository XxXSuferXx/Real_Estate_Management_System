import { z } from 'zod';
import { checkPasswordStrength } from '../common/utils/passwordStrength.js';

// ==========================================
// 1. REGISTER SCHEMA
// ==========================================
export const registerSchema = z.object({
  body: z
    .object({
      username: z.string().min(2, 'Name must be at least 2 characters').max(100),
      email: z.string().email('Invalid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
      role: z.enum(['buyer', 'seller', 'agent']).default('buyer'),
    })

    .check((ctx) => {
      const { isStrongEnough, score, warning, suggestions } = checkPasswordStrength(
        ctx.value.password,
        [ctx.value.username, ctx.value.email]
      );

      if (!isStrongEnough) {
        ctx.issues.push({
          code: 'custom',
          path: ['password'],
          input: ctx.value.password,
          message:
            warning ||
            `Password is too weak (score ${score}/4).${
              suggestions.length ? ' ' + suggestions.join(' ') : ''
            }`,
        });
      }
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];

// ==========================================
// 2. LOGIN SCHEMA
// ==========================================
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .lowercase()
      .email('Invalid email address'),
    password: z
      .string()
      .min(1, 'Password is required'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
