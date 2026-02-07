import { NextFunction, Response } from 'express';
import { UserRole } from '../models';
import DecodeToken from '../utils/jwt/decode-token';
import { getUserToken } from '../utils/redis/auth/auth';
import { AuthenticatedRequest } from './is-authorized';

/**
 * Middleware to optionally authenticate requests using Bearer tokens.
 * Unlike isAuthorized, this middleware does NOT reject requests without tokens.
 * It simply attaches user information if a valid token is present.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
const isOptionallyAuthorized = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Retrieve the Authorization header from the request or token from cookies
    const authHeader: string | undefined = req.headers['authorization'] || req.cookies?.token;

    // If no auth header, proceed without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    // Extract the user ID from the Bearer token
    const accessToken = authHeader.split(' ')[1];

    // Retrieve the actual token from Redis
    const token = await getUserToken(accessToken);

    // If token is invalid or expired, proceed without authentication
    if (!token) {
      return next();
    }

    // Decode the token to get user details
    const decodedToken = await DecodeToken(token);

    // If decoding failed, proceed without authentication
    if (!decodedToken) {
      return next();
    }

    // decoded user details
    const { _id, email, role, loginHash } = decodedToken as {
      _id: string;
      email: string;
      role: UserRole;
      loginHash: string;
    };

    // Attach user information to the request object
    req.user = {
      _id,
      email,
      role: role as UserRole,
      loginHash,
    };

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    // On error, proceed without authentication
    next();
  }
};

export default isOptionallyAuthorized;
