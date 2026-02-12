import { Request, Response } from 'express';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { subscriptionTrialServices } from './subscription-trial.service';

/**
 * Controller function to handle the creation of a single subscription-trial.
 *
 * @param {Request} req - The request object containing subscription-trial data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionTrial>>} - The created subscription-trial.
 * @throws {Error} - Throws an error if the subscription-trial creation fails.
 */
export const createSubscriptionTrial = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Use the authenticated user's ID from the request object
    const userId = req.user!._id;
    req.body.userId = userId; // Associate the subscription-trial with the authenticated user
    // Call the service method to create a subscription-trial and get the result
    const result = await subscriptionTrialServices.createSubscriptionTrial(req.body);
    if (!result) throw new Error('Failed to create subscription-trial');
    // Send a success response with the created subscription-trial data
    ServerResponse(res, true, 201, 'Subscription-trial created successfully', result);
  }
);
