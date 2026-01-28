import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import ServerResponse from '../helpers/responses/custom-response';
import { UserRole } from '../models';
import DecodeToken from '../utils/jwt/decode-token';
import { getUserToken } from '../utils/redis/auth/auth';

// Extend the Request interface to include a user property
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    fullName: string;
    email: string;
    role: UserRole;
    isEmailVerified: boolean;
  };
}

/**
 * Middleware to authenticate requests using Bearer tokens.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
const isAuthorized = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Retrieve the Authorization header from the request or token from cookies
    const authHeader: string | undefined = req.headers['authorization'] || req.cookies?.token;

    // Check if the Authorization header is present and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ServerResponse(res, false, 401, 'Authorization header missing or malformed');
    }

    // Extract the token from the Authorization header
    const token = await getUserToken(authHeader.split(' ')[1]);

    if (!token) {
      return ServerResponse(res, false, 401, 'Invalid or expired token');
    }

    const decodedToken = await DecodeToken(token);

    if (!decodedToken) {
      return ServerResponse(res, false, 401, 'Failed to decode token');
    }

    // decoded user details
    const { _id, fullName, email, role, isEmailVerified } = decodedToken as JwtPayload;

    // Attach user information to the request object
    req.user = {
      _id,
      fullName,
      email,
      role,
      isEmailVerified,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    // Handle any unexpected errors
    return ServerResponse(res, false, 401, 'Unauthorized');
  }
};

export default isAuthorized;
