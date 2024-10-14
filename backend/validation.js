import { z } from 'zod';

export const registerValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(1).max(50),
});

export const loginValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});