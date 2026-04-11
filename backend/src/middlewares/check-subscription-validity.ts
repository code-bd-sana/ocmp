import { NextFunction, Request, Response } from 'express';
import ServerResponse from '../helpers/responses/custom-response';
import { getSubscriptionRemainingDays } from '../modules/subscription-remain/subscription-remain.service';
import { AuthenticatedRequest } from './is-authorized';
import { UserRole } from '../models/users-accounts/user.schema';

/**
 * Middleware to check if the user can perform write actions.
 * - Transport Manager: must have an active subscription or trial.
 * - Standalone User: can write if they have an approved manager assignment, or if they have an active subscription or trial.
 * - If none of the above applies, access is denied with a 403 response.
 * - If there is any error during the process, a 500 response is returned.
 */
const checkSubscriptionValidity = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;

  if (!user?._id) {
    return res.status(401).json({ message: 'Unauthorized. User not found on request.' });
  }

  try {
    const userSubscription = await getSubscriptionRemainingDays(user._id);

    if (!userSubscription) {
      return ServerResponse(
        res,
        false,
        403,
        'Access denied. No active subscription or trial found.'
      );
    }

    if (user.role === UserRole.STANDALONE_USER && userSubscription.accessGranted) {
      return next();
    }

    const currentDate = new Date();

    // Lifetime subscription → allow
    if (userSubscription.isLifetime || userSubscription.accessGranted) {
      return next();
    }

    // Expired subscription
    if (userSubscription.endDate && userSubscription.endDate < currentDate) {
      return ServerResponse(res, false, 403, 'Access denied. Subscription or trial has expired.');
    }

    // Valid subscription
    return next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return ServerResponse(res, false, 500, 'Internal server error');
  }
};

export default checkSubscriptionValidity;
