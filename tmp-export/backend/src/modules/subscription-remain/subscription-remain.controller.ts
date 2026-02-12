import { Response } from 'express';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { getSubscriptionRemainingDays } from './subscription-remain.service';

/**
 * Controller to get remaining subscription days for the authenticated user
 */
export const getSubscriptionRemainingDaysController = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Get the authenticated user's ID from the request object
    const userId = req.user!._id;
    // Call the service function to get the remaining subscription days
    const result = await getSubscriptionRemainingDays(userId as string);
    ServerResponse(res, true, 200, 'Subscription remaining days retrieved', result);
  }
);
