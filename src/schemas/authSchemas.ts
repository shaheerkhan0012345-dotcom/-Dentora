import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

export const signUpSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Full name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  role: z
    .enum(['Admin', 'Doctor', 'Receptionist', 'Assistant', 'Patient'])
    .default('Patient'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type SignUpSchemaType = z.infer<typeof signUpSchema>;
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
