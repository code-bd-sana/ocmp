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
    const userId = req.user!._id;
    const result = await getSubscriptionRemainingDays(userId as string);
    ServerResponse(res, true, 200, 'Subscription remaining days retrieved', result);
  }
);
