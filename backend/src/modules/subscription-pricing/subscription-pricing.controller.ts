import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { subscriptionPricingServices } from './subscription-pricing.service';

/**
 * Controller function to handle the creation of a single subscription-pricing.
 *
 * @param {Request} req - The request object containing subscription-pricing data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The created subscription-pricing.
 * @throws {Error} - Throws an error if the subscription-pricing creation fails.
 */
export const createSubscriptionPricing = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Use the authenticated user's ID as the creator
    const userId = req.user!._id;
    // Request body assignment for createdBy field
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // Call the service method to create the subscription-pricing and get the result
    const result = await subscriptionPricingServices.createSubscriptionPricing(req.body);
    if (!result) throw new Error('Failed to create Subscription-pricing');
    // Send a success response with the created subscription-pricing data
    ServerResponse(res, true, 201, 'Subscription-pricing created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single subscription-pricing.
 *
 * @param {Request} req - The request object containing the ID of the subscription-pricing to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The updated subscription-pricing.
 * @throws {Error} - Throws an error if the subscription-pricing update fails.
 */
export const updateSubscriptionPricing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the subscription-pricing by ID and get the result
  const result = await subscriptionPricingServices.updateSubscriptionPricing(
    id as string,
    req.body
  );
  if (!result) throw new Error('Failed to update Subscription-pricing');
  // Send a success response with the updated subscription-pricing data
  ServerResponse(res, true, 200, 'Subscription-pricing updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single subscription-pricing.
 *
 * @param {Request} req - The request object containing the ID of the subscription-pricing to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The deleted subscription-pricing.
 * @throws {Error} - Throws an error if the subscription-pricing deletion fails.
 */
export const deleteSubscriptionPricing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the subscription-pricing by ID
  const result = await subscriptionPricingServices.deleteSubscriptionPricing(id as string);
  if (!result) throw new Error('Failed to delete Subscription-pricing');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Subscription-pricing deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple subscription-pricing(s).
 *
 * @param {Request} req - The request object containing an array of IDs of subscription-pricing to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The deleted subscription-pricing(s).
 * @throws {Error} - Throws an error if the subscription-pricing deletion fails.
 */
export const deleteManySubscriptionPricing = catchAsync(async (req: Request, res: Response) => {
  // Extract ids from request body
  const { ids } = req.body;
  // Call the service method to delete multiple subscription-pricing(s) and get the result
  const result = await subscriptionPricingServices.deleteManySubscriptionPricing(ids);
  if (!result) throw new Error('Failed to delete multiple subscription-pricing(s)');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'Subscription-pricing(s) deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single subscription-pricing by ID.
 *
 * @param {Request} req - The request object containing the ID of the subscription-pricing to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The retrieved subscription-pricing.
 * @throws {Error} - Throws an error if the subscription-pricing retrieval fails.
 */
export const getSubscriptionPricingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the subscription-pricing by ID and get the result
  const result = await subscriptionPricingServices.getSubscriptionPricingById(id as string);
  if (!result) throw new Error('Subscription-pricing not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Subscription-pricing retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple subscription-pricing(s).
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The retrieved subscription-pricing(s).
 * @throws {Error} - Throws an error if the subscription-pricing(s) retrieval fails.
 */
export const getManySubscriptionPricing = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters
  const query = req.query as SearchQueryInput;
  // Call the service method to get multiple subscription-pricings based on query parameters and get the result
  const { subscriptionPricings, totalData, totalPages } =
    await subscriptionPricingServices.getManySubscriptionPricing(query);
  if (!subscriptionPricings) throw new Error('Failed to retrieve subscription-pricing(s)');
  // Send a success response with the retrieved subscription-pricing(s) data
  ServerResponse(res, true, 200, 'Subscription-pricing(s) retrieved successfully', {
    subscriptionPricings,
    totalData,
    totalPages,
  });
});
