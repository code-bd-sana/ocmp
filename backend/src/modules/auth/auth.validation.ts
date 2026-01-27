import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import zodErrorHandler from '../../handlers/zod-error-handler';

/**
 * Authentication Validation Schemas and Types
 *
 * This module defines Zod schemas for validating authentication-related
 * requests such as login, registration, password reset, and email verification.
 * It also exports corresponding TypeScript types inferred from these schemas.
 *
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Additionally, named validator middleware functions are exported for use
 * in Express routes to validate incoming requests against the defined schemas.
 */

/**
 * Zod schema for validating login data.
 */
export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Invalid email format' })
    .trim()
    .toLowerCase(),
  password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Zod schema for validating registration data.
 */
export const registerSchema = z.object({
  keyCloakId: z.string().optional(),
  fullName: z
    .string({ message: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .trim(),
  email: z.email({ message: 'Invalid email format' }).trim().toLowerCase(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  role: z.enum(['TRANSPORT_MANAGER', 'STANDALONE_USER'] as const),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Zod schema for validating forgot password data.
 */
export const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Invalid email format' }).trim().toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Zod schema for validating reset password data.
 */
export const resetPasswordSchema = z
  .object({
    token: z.string({ message: 'Reset token is required' }),
    password: z
      .string({ message: 'New password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirmPassword: z.string({ message: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Zod schema for validating change password data.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ message: 'Current password is required' })
      .min(1, 'Current password is required'),
    newPassword: z
      .string({ message: 'New password is required' })
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirmNewPassword: z.string({ message: 'Confirm new password is required' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Zod schema for validating email verification data.
 */
export const verifyEmailSchema = z.object({
  email: z.email({ message: 'Invalid email format' }).trim().toLowerCase(),
  token: z.string({ message: 'Verification token is required' }),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * Zod schema for validating resend verification email data.
 */
export const resendVerificationEmailSchema = z.object({
  email: z.email({ message: 'Invalid email format' }).trim().toLowerCase(),
});

export type ResendVerificationEmailInput = z.infer<typeof resendVerificationEmailSchema>;

/**
 * Export named validators (as used in your router)
 */
export const validateLoginAuth = validate(loginSchema);
export const validateRegisterAuth = validate(registerSchema);
export const forgetPasswordAuth = validate(forgotPasswordSchema);
export const resetPasswordAuth = validate(resetPasswordSchema);
export const changePasswordAuth = validate(changePasswordSchema);
export const verifyEmailTokenAuth = validate(verifyEmailSchema);
export const resendVerificationEmailAuth = validate(resendVerificationEmailSchema);

/**
 * Helper (assuming you have something like this)
 */
function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return zodErrorHandler(req, res, result.error);
    }

    // Optional: attach validated & typed data
    req.body = result.data;

    next();
  };
}
