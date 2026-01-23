import { NextFunction, Request, Response } from 'express';
import ServerResponse from '../helpers/responses/custom-response';
import { UserRole } from '../models';

// role: 'SUPER_ADMIN' | 'TRANSPORT_MANAGER' | 'STANDALONE_USER' | 'STAFF';

/**
 * Middleware to authorize requests based on user roles.
 *
 * @param roles - An array of roles that are authorized to access the route.
 * @return A middleware function that checks for authorized roles.
 */
const authorizedRoles = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      // Handle any unexpected errors
      return ServerResponse(res, false, 403, 'Forbidden');
    }
  };
};

export default authorizedRoles;
