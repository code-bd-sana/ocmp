import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { subscriptionPricingServices } from './subscription-pricing.service';

/**
 * Controller function to handle the creation of a single SubscriptionPricing.
 *
 * @param {Request} req - The request object containing subscription-pricing data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The created subscriptionPricing.
 * @throws {Error} - Throws an error if the subscriptionPricing creation fails.
 */
export const createSubscriptionPricing = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Call the service method to create a new subscription-pricing and get the result
    // Call the service method to create a new subscription-plan and get the result

    // Use the authenticated user's ID as the creator
    const userId = req.user!._id;
    // Request body assignment for createdBy field
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    const result = await subscriptionPricingServices.createSubscriptionPricing(req.body);
    if (!result) throw new Error('Failed to create subscriptionPricing');
    // Send a success response with the created subscriptionPricing data
    ServerResponse(res, true, 201, 'SubscriptionPricing created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single subscription-pricing.
 *
 * @param {Request} req - The request object containing the ID of the subscription-pricing to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The updated subscriptionPricing.
 * @throws {Error} - Throws an error if the subscriptionPricing update fails.
 */
export const updateSubscriptionPricing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the subscription-pricing by ID and get the result
  const result = await subscriptionPricingServices.updateSubscriptionPricing(
    id as string,
    req.body
  );
  if (!result) throw new Error('Failed to update subscriptionPricing');
  // Send a success response with the updated subscription-pricing data
  ServerResponse(res, true, 200, 'SubscriptionPricing updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single subscription-pricing.
 *
 * @param {Request} req - The request object containing the ID of the subscription-pricing to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The deleted subscriptionPricing.
 * @throws {Error} - Throws an error if the subscriptionPricing deletion fails.
 */
export const deleteSubscriptionPricing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the subscription-pricing by ID
  const result = await subscriptionPricingServices.deleteSubscriptionPricing(id as string);
  if (!result) throw new Error('Failed to delete subscriptionPricing');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'SubscriptionPricing deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple subscription-pricings.
 *
 * @param {Request} req - The request object containing an array of IDs of subscription-pricing to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The deleted subscriptionPricings.
 * @throws {Error} - Throws an error if the subscriptionPricing deletion fails.
 */
export const deleteManySubscriptionPricing = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to delete multiple subscription-pricings and get the result
  const result = await subscriptionPricingServices.deleteManySubscriptionPricing(req.body);
  if (!result) throw new Error('Failed to delete multiple subscriptionPricings');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'SubscriptionPricings deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single subscription-pricing by ID.
 *
 * @param {Request} req - The request object containing the ID of the subscription-pricing to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The retrieved subscriptionPricing.
 * @throws {Error} - Throws an error if the subscriptionPricing retrieval fails.
 */
export const getSubscriptionPricingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the subscription-pricing by ID and get the result
  const result = await subscriptionPricingServices.getSubscriptionPricingById(id as string);
  if (!result) throw new Error('SubscriptionPricing not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'SubscriptionPricing retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple subscription-pricings.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The retrieved subscriptionPricings.
 * @throws {Error} - Throws an error if the subscriptionPricings retrieval fails.
 */
export const getManySubscriptionPricing = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters
  const query = req.query as SearchQueryInput;
  // Call the service method to get multiple subscription-pricings based on query parameters and get the result
  const { subscriptionPricings, totalData, totalPages } =
    await subscriptionPricingServices.getManySubscriptionPricing(query);
  if (!subscriptionPricings) throw new Error('Failed to retrieve subscriptionPricings');
  // Send a success response with the retrieved subscription-pricings data
  ServerResponse(res, true, 200, 'SubscriptionPricings retrieved successfully', {
    subscriptionPricings,
    totalData,
    totalPages,
  });
});

