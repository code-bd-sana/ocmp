import { Request, Response } from 'express';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
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
 * Controller function to handle the creation of multiple subscription-trials.
 *
 * @param {Request} req - The request object containing an array of subscription-trial data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionTrial>[]>} - The created subscription-trials.
 * @throws {Error} - Throws an error if the subscription-trials creation fails.
 */
export const createManySubscriptionTrial = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create multiple subscription-trials and get the result
  const result = await subscriptionTrialServices.createManySubscriptionTrial(req.body);
  if (!result) throw new Error('Failed to create multiple subscription-trials');
  // Send a success response with the created subscription-trials data
  ServerResponse(res, true, 201, 'Subscription-trials created successfully', result);
});

/**
 * Controller function to handle the update operation for a single subscription-trial.
 *
 * @param {Request} req - The request object containing the ID of the subscription-trial to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionTrial>>} - The updated subscription-trial.
 * @throws {Error} - Throws an error if the subscription-trial update fails.
 */
export const updateSubscriptionTrial = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the subscription-trial by ID and get the result
  const result = await subscriptionTrialServices.updateSubscriptionTrial(id as string, req.body);
  if (!result) throw new Error('Failed to update subscription-trial');
  // Send a success response with the updated subscription-trial data
  ServerResponse(res, true, 200, 'Subscription-trial updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple subscription-trials.
 *
 * @param {Request} req - The request object containing an array of subscription-trial data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionTrial>[]>} - The updated subscription-trials.
 * @throws {Error} - Throws an error if the subscription-trials update fails.
 */
export const updateManySubscriptionTrial = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to update multiple subscription-trials and get the result
  const result = await subscriptionTrialServices.updateManySubscriptionTrial(req.body);
  if (!result.length) throw new Error('Failed to update multiple subscription-trials');
  // Send a success response with the updated subscription-trials data
  ServerResponse(res, true, 200, 'Subscription-trials updated successfully', result);
});

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
 * Controller function to handle the deletion of multiple subscription-trials.
 *
 * @param {Request} req - The request object containing an array of IDs of subscription-trial to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionTrial>[]>} - The deleted subscription-trials.
 * @throws {Error} - Throws an error if the subscription-trial deletion fails.
 */
export const deleteManySubscriptionTrial = catchAsync(async (req: Request, res: Response) => {
  // Extract ids from request body
  const { ids } = req.body;
  // Call the service method to delete multiple subscription-trials and get the result
  const result = await subscriptionTrialServices.deleteManySubscriptionTrial(ids);
  if (!result) throw new Error('Failed to delete multiple subscription-trials');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'Subscription-trials deleted successfully');
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
 * Controller function to handle the retrieval of multiple subscription-trials.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionTrial>[]>} - The retrieved subscription-trials.
 * @throws {Error} - Throws an error if the subscription-trials retrieval fails.
 */
export const getManySubscriptionTrial = catchAsync(async (req: Request, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  const query = (req as any).validatedQuery as SearchQueryInput;
  // Call the service method to get multiple subscription-trials based on query parameters and get the result
  const { subscriptionTrials, totalData, totalPages } =
    await subscriptionTrialServices.getManySubscriptionTrial(query);
  if (!subscriptionTrials) throw new Error('Failed to retrieve subscription-trials');
  // Send a success response with the retrieved subscription-trials data
  ServerResponse(res, true, 200, 'Subscription-trials retrieved successfully', {
    subscriptionTrials,
    totalData,
    totalPages,
  });
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

