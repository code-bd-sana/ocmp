import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware for forget password requests.
 *
 * Limits each IP to 3 requests every 15 minutes.
 * Returns a 429 status code with a message if the limit is exceeded.
 * Uses standard rate limit headers.
 * Disables legacy rate limit headers.
 */
export const forgetPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many password reset requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
