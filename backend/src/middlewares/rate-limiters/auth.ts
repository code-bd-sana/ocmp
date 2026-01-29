import { createRateLimiter } from '.';

/**
 * Rate limiter middleware for forget password requests.
 *
 * Limits each IP to 3 requests every 15 minutes.
 */
export const forgetPasswordRateLimiter = createRateLimiter({
  windowMinutes: 15,
  maxRequests: 3,
  message: 'Too many password reset requests from this IP, please try again after 15 minutes',
});

/**
 * Rate limiter middleware for resending email verification requests.
 *
 * Limits each IP to 5 requests every 15 minutes.
 */
export const resendEmailVerificationRateLimiter = createRateLimiter({
  windowMinutes: 15,
  maxRequests: 5,
  message: 'Too many email verification requests from this IP, please try again after 15 minutes',
});
