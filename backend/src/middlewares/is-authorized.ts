import { NextFunction, Request, Response } from 'express';
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
    loginHash: string;
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

    // Extract the user ID from the Bearer token
    const accessToken = authHeader.split(' ')[1];

    // Retrieve the actual token from Redis
    const token = await getUserToken(accessToken);

    // Extract the token from the Authorization header
    if (!token) {
      return ServerResponse(res, false, 401, 'Invalid or expired token');
    }

    // Decode the token to get user details
    const decodedToken = await DecodeToken(token);

    // Check if decoding was successful
    if (!decodedToken) {
      return ServerResponse(res, false, 401, 'Failed to decode token');
    }

    // decoded user details
    const { _id, fullName, email, role, isEmailVerified, loginHash } = decodedToken as {
      _id: string;
      fullName: string;
      email: string;
      role: UserRole;
      isEmailVerified: boolean;
      loginHash: string;
    };

    // Attach user information to the request object
    req.user = {
      _id,
      fullName,
      email,
      role,
      isEmailVerified,
      loginHash,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    // Handle any unexpected errors
    return ServerResponse(res, false, 401, 'Unauthorized');
  }
};

export default isAuthorized;
