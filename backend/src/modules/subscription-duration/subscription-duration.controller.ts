import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { subscriptionDurationServices } from './subscription-duration.service';

/**
 * Controller function to handle the creation of a single SubscriptionDuration.
 *
 * @param {Request} req - The request object containing subscription-duration data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The created subscriptionDuration.
 * @throws {Error} - Throws an error if the subscriptionDuration creation fails.
 */
export const createSubscriptionDuration = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Use the authenticated user's ID as the creator
    const userId = req.user!._id;
    // Request body assignment for createdBy field
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    const result = await subscriptionDurationServices.createSubscriptionDuration(req.body);
    if (!result) throw new Error('Failed to create subscription duration');
    // Send a success response with the created subscriptionDuration data
    ServerResponse(res, true, 201, 'Subscription duration created successfully', result);
  }
);

/**
 * Controller function to handle the creation of multiple subscription-durations.
 *
 * @param {Request} req - The request object containing an array of subscription-duration data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The created subscriptionDurations.
 * @throws {Error} - Throws an error if the subscriptionDurations creation fails.
 */
export const createManySubscriptionDuration = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Use the authenticated user's ID as the creator for each item
    const userId = req.user!._id;
    // Request body assignment for createdBy field for each item
    req.body = req.body.map((item: any) => ({
      ...item,
      createdBy: new mongoose.Types.ObjectId(userId),
    }));
    // Call the service method to create multiple subscriptionDurations and get the result
    const result = await subscriptionDurationServices.createManySubscriptionDuration(req.body);
    if (!result) throw new Error('Failed to create multiple subscription durations');
    // Send a success response with the created subscription-durations data
    ServerResponse(res, true, 201, 'Subscription durations created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single subscription-duration.
 *
 * @param {Request} req - The request object containing the ID of the subscription-duration to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The updated subscriptionDuration.
 * @throws {Error} - Throws an error if the subscriptionDuration update fails.
 */
export const updateSubscriptionDuration = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the subscription-duration by ID and get the result
  const result = await subscriptionDurationServices.updateSubscriptionDuration(
    id as string,
    req.body
  );
  if (!result) throw new Error('Failed to update subscription duration');
  // Send a success response with the updated subscription-duration data
  ServerResponse(res, true, 200, 'Subscription duration updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple subscription-durations.
 *
 * @param {Request} req - The request object containing an array of subscription-duration data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The updated subscriptionDurations.
 * @throws {Error} - Throws an error if the subscriptionDurations update fails.
 */
export const updateManySubscriptionDuration = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to update multiple subscription-durations and get the result
  const result = await subscriptionDurationServices.updateManySubscriptionDuration(req.body);
  if (!result.length) throw new Error('Failed to update multiple subscription durations');
  // Send a success response with the updated subscription-durations data
  ServerResponse(res, true, 200, 'Subscription durations updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single subscription-duration.
 *
 * @param {Request} req - The request object containing the ID of the subscription-duration to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The deleted subscriptionDuration.
 * @throws {Error} - Throws an error if the subscriptionDuration deletion fails.
 */
export const deleteSubscriptionDuration = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the subscription-duration by ID
  const result = await subscriptionDurationServices.deleteSubscriptionDuration(id as string);
  if (!result) throw new Error('Failed to delete subscription duration');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Subscription duration deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple subscription-durations.
 *
 * @param {Request} req - The request object containing an array of IDs of subscription-duration to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The deleted subscriptionDurations.
 * @throws {Error} - Throws an error if the subscriptionDuration deletion fails.
 */
export const deleteManySubscriptionDuration = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to delete multiple subscription-durations and get the result
  const result = await subscriptionDurationServices.deleteManySubscriptionDuration(req.body);
  if (!result) throw new Error('Failed to delete multiple subscription durations');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'Subscription durations deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single subscription-duration by ID.
 *
 * @param {Request} req - The request object containing the ID of the subscription-duration to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The retrieved subscriptionDuration.
 * @throws {Error} - Throws an error if the subscriptionDuration retrieval fails.
 */
export const getSubscriptionDurationById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the subscription-duration by ID and get the result
  const result = await subscriptionDurationServices.getSubscriptionDurationById(id as string);
  if (!result) throw new Error('Subscription duration not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Subscription duration retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple subscription-durations.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The retrieved subscriptionDurations.
 * @throws {Error} - Throws an error if the subscriptionDurations retrieval fails.
 */
export const getManySubscriptionDuration = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters
  const query = req.query as unknown as {
    searchKey?: string;
    showPerPage: number;
    pageNo: number;
  };
  // Call the service method to get multiple subscription-durations based on query parameters and get the result
  const { subscriptionDurations, totalData, totalPages } =
    await subscriptionDurationServices.getManySubscriptionDuration(query);
  if (!subscriptionDurations) throw new Error('Failed to retrieve subscription durations');
  // Send a success response with the retrieved subscription-durations data
  ServerResponse(res, true, 200, 'Subscription durations retrieved successfully', {
    subscriptionDurations,
    totalData,
    totalPages,
  });
});
