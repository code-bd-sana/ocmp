import { Request, Response } from 'express';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import catchAsync from '../../utils/catch-async/catch-async';
import { subscriptionTrialServices } from './subscription-trial.service';

/**
 * Controller function to handle the creation of a single subscription trial.
 *
 * @param {Request} req - The request object containing subscription trial data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionTrial>>} - The created subscription trial.
 * @throws {Error} - Throws an error if the subscription trial creation fails.
 */
export const createSubscriptionTrial = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Super admin can create trial for any userId passed in body.
    // Other roles can create trial only for themselves.
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    req.body.userId = isSuperAdmin ? req.body.userId || req.user!._id : req.user!._id;

    // Call the service method to create a subscription trial and get the result
    const result = await subscriptionTrialServices.createSubscriptionTrial(req.body);
    if (!result) throw new Error('Failed to create subscription trial');
    // Send a success response with the created subscription trial data
    ServerResponse(res, true, 201, 'Subscription trial created successfully', result);
  }
);

/**
 * Controller to get one-time trial eligibility from DB-backed rules.
 */
export const getSubscriptionTrialEligibility = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const targetUserId = isSuperAdmin
      ? (req.query.userId as string) || req.user!._id
      : req.user!._id;

    const result = await subscriptionTrialServices.getSubscriptionTrialEligibility(
      targetUserId,
      req.user?.role
    );

    ServerResponse(res, true, 200, 'Subscription trial eligibility retrieved', result);
  }
);
