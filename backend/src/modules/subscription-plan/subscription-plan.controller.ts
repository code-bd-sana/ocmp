import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { subscriptionPlanServices } from './subscription-plan.service';

/**
 * Controller function to handle the creation of a single SubscriptionPlan.
 *
 * @param {Request} req - The request object containing subscription-plan data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The created subscriptionPlan.
 * @throws {Error} - Throws an error if the subscriptionPlan creation fails.
 */
export const createSubscriptionPlan = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Call the service method to create a new subscription-plan and get the result

    // Use the authenticated user's ID as the creator
    const userId = req.user!._id;
    // Request body assignment for createdBy field
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    const result = await subscriptionPlanServices.createSubscriptionPlan(req.body);
    if (!result) throw new Error('Failed to create subscriptionPlan');
    // Send a success response with the created subscriptionPlan data
    ServerResponse(res, true, 201, 'SubscriptionPlan created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single subscription-plan.
 *
 * @param {Request} req - The request object containing the ID of the subscription-plan to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The updated subscriptionPlan.
 * @throws {Error} - Throws an error if the subscriptionPlan update fails.
 */
export const updateSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the subscription-plan by ID and get the result
  const result = await subscriptionPlanServices.updateSubscriptionPlan(id as string, req.body);
  if (!result) throw new Error('Failed to update subscriptionPlan');
  // Send a success response with the updated subscription-plan data
  ServerResponse(res, true, 200, 'SubscriptionPlan updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single subscription-plan.
 *
 * @param {Request} req - The request object containing the ID of the subscription-plan to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The deleted subscriptionPlan.
 * @throws {Error} - Throws an error if the subscriptionPlan deletion fails.
 */
export const deleteSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the subscription-plan by ID
  const result = await subscriptionPlanServices.deleteSubscriptionPlan(id as string);
  if (!result) throw new Error('Failed to delete subscriptionPlan');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'SubscriptionPlan deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple subscription-plans.
 *
 * @param {Request} req - The request object containing an array of IDs of subscription-plan to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The deleted subscriptionPlans.
 * @throws {Error} - Throws an error if the subscriptionPlan deletion fails.
 */
export const deleteManySubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  // Extract ids from request body
  const { ids } = req.body;
  // Call the service method to delete multiple subscription-plans and get the result
  const result = await subscriptionPlanServices.deleteManySubscriptionPlan(ids);
  if (!result) throw new Error('Failed to delete multiple subscriptionPlans');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'SubscriptionPlans deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single subscription-plan by ID.
 *
 * @param {Request} req - The request object containing the ID of the subscription-plan to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The retrieved subscriptionPlan.
 * @throws {Error} - Throws an error if the subscriptionPlan retrieval fails.
 */
export const getSubscriptionPlanById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the subscription-plan by ID and get the result
  const result = await subscriptionPlanServices.getSubscriptionPlanById(id as string);
  if (!result) throw new Error('SubscriptionPlan not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'SubscriptionPlan retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple subscription-plans.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The retrieved subscriptionPlans.
 * @throws {Error} - Throws an error if the subscriptionPlans retrieval fails.
 */
export const getManySubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters
  const query = req.query as SearchQueryInput;
  console.log(query, 'query chcek');
  // Call the service method to get multiple subscription-plans based on query parameters and get the result
  const { subscriptionPlans, totalData, totalPages } =
    await subscriptionPlanServices.getManySubscriptionPlan(query);
  if (!subscriptionPlans) throw new Error('Failed to retrieve subscriptionPlans');
  // Send a success response with the retrieved subscription-plans data
  ServerResponse(res, true, 200, 'SubscriptionPlans retrieved successfully', {
    subscriptionPlans,
    totalData,
    totalPages,
  });
});
