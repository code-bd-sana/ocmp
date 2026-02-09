import { Request, Response } from 'express';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { getTrialRemainingDays, subscriptionTrialServices } from './subscription-trial.service';

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

/**
 * Controller function to handle the deletion of a single subscription-trial.
 *
 * @param {Request} req - The request object containing the ID of the subscription-trial to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionTrial>>} - The deleted subscription-trial.
 * @throws {Error} - Throws an error if the subscription-trial deletion fails.
 */
export const deleteSubscriptionTrial = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the subscription-trial by ID
  const result = await subscriptionTrialServices.deleteSubscriptionTrial(id as string);
  if (!result) throw new Error('Failed to delete subscription-trial');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Subscription-trial deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single subscription-trial by ID.
 *
 * @param {Request} req - The request object containing the ID of the subscription-trial to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionTrial>>} - The retrieved subscription-trial.
 * @throws {Error} - Throws an error if the subscription-trial retrieval fails.
 */
export const getSubscriptionTrialById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the subscription-trial by ID and get the result
  const result = await subscriptionTrialServices.getSubscriptionTrialById(id as string);
  if (!result) throw new Error('Subscription-trial not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Subscription-trial retrieved successfully', result);
});

/**
 * Controller to get remaining trial days for the authenticated user
 */
export const getTrialRemainingDaysController = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    const result = await getTrialRemainingDays(userId as string);
    ServerResponse(res, true, 200, 'Trial remaining days retrieved', result);
  }
);
