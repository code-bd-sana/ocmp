import { NextFunction, Request, Response } from 'express';

/**
 * Middleware to extract request metadata such as IP address and user agent.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const requestMeta = (req: Request, res: Response, next: NextFunction) => {
  // Real IP (production safe)
  const ip =
    req.headers['cf-connecting-ip'] || // Cloudflare
    (typeof req.headers['x-forwarded-for'] === 'string'
      ? req.headers['x-forwarded-for'].split(',')[0]?.trim()
      : undefined) ||
    req.socket.remoteAddress;

  req.body.ipAddress = ip;
  req.body.userAgent = req.headers['user-agent'];

  next();
};
