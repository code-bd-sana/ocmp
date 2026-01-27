import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
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

    // First, try validating token with Keycloak's userinfo endpoint
    try {
      const kcRes = await axios.get(
        `${config.KEYCLOAK_HOST}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const userInfo = kcRes.data || {};

      const _id = userInfo.sub || (userInfo.id as string) || '';
      const fullName = userInfo.name || userInfo.preferred_username || '';
      const email = userInfo.email || '';

      // Attempt to infer role from Keycloak userinfo (may be absent)
      // Keycloak often returns roles under `realm_access.roles` when configured
      const roleFromKc =
        (userInfo.realm_access && userInfo.realm_access.roles && userInfo.realm_access.roles[0]) ||
        undefined;

      req.user = {
        _id,
        fullName,
        email,
        role: (roleFromKc as UserRole) || (UserRole as any).USER,
        isEmailVerified: userInfo.email_verified || false,
      };
    } catch (kcErr) {
      // If Keycloak validation fails, fallback to local JWT verification
      const decoded = await DecodeToken(token);

      // If token decoding fails as well, respond with unauthorized
      if (!decoded) {
        return ServerResponse(res, false, 401, 'Unauthorized');
      }

      const { email, _id, fullName, role, isEmailVerified } = decoded as {
        _id: string;
        fullName: string;
        email: string;
        role: UserRole;
        isEmailVerified: boolean;
      };

      req.user = { _id, fullName, email, role, isEmailVerified };
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    // Handle any unexpected errors
    return ServerResponse(res, false, 401, 'Unauthorized');
  }
};

export default isAuthorized;
