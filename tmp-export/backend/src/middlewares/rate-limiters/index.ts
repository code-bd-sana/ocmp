import rateLimit from 'express-rate-limit';

interface RateLimiterOptions {
  windowMinutes?: number;
  maxRequests?: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

/**
 * Creates a reusable rate limiter middleware with configurable options.
 *
 * @param options - Configuration options for the rate limiter
 * @param options.windowMinutes - Time window in minutes (default: 15)
 * @param options.maxRequests - Maximum number of requests per window (default: 3)
 * @param options.message - Custom error message when limit is exceeded
 * @param options.standardHeaders - Return rate limit info in `RateLimit-*` headers (default: true)
 * @param options.legacyHeaders - Enable `X-RateLimit-*` headers (default: false)
 * @returns Rate limiter middleware
 */
export const createRateLimiter = ({
  windowMinutes = 15,
  maxRequests = 3,
  message = `Too many requests from this IP, please try again after ${windowMinutes} minutes`,
  standardHeaders = true,
  legacyHeaders = false,
}: RateLimiterOptions = {}) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message,
    standardHeaders,
    legacyHeaders,
  });
};
