import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { subscriptionPricingServices } from './subscription-pricing.service';
import {
  CreateSubscriptionPricingInput,
  UpdateSubscriptionPricingInput,
} from './subscription-pricing.validation';

/**
 * Controller function to handle the creation of a new subscription pricing.
 *
 * @param {Request} req - The request object containing subscription pricing data.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<ISubscriptionPricing>} - The created subscription pricing.
 */
export const createSubscriptionPricing = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    // Request body assignment for createdBy field
    req.body.createdBy = new mongoose.Types.ObjectId(userId);

    const result = await subscriptionPricingServices.createSubscriptionPricing(
      req.body as CreateSubscriptionPricingInput
    );

    // Send a success response with the created subscription pricing data
    ServerResponse(res, true, 201, 'Subscription pricing created successfully', result);
  }
);

/**
 * Controller function to handle the update of a subscription pricing by ID.
 *
 * @param {Request} req - The request object containing subscription pricing data and ID in URL params.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<ISubscriptionPricing>} - The updated subscription pricing.
 */
export const updateSubscriptionPricing = catchAsync(async (req: Request, res: Response) => {
  let { id } = req.params; // Getting the ID from URL params

  // If id is an array, extract the first element as a string
  if (Array.isArray(id)) {
    id = id[0];
  }

  const result = await subscriptionPricingServices.updateSubscriptionPricing(
    id,
    req.body as UpdateSubscriptionPricingInput
  );

  // Send a success response with the updated subscription pricing data
  ServerResponse(res, true, 200, 'Subscription pricing updated successfully', result);
});

/**
 * Controller function to handle the deletion of a subscription pricing by ID.
 *
 * @param {Request} req - The request object containing the ID of the subscription pricing to delete.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - Confirms that the subscription pricing was deleted.
 */
export const deleteSubscriptionPricing = catchAsync(async (req: Request, res: Response) => {
  let { id } = req.params; // Getting the ID from URL params

  // If id is an array, extract the first element as a string
  if (Array.isArray(id)) {
    id = id[0];
  }

  await subscriptionPricingServices.deleteSubscriptionPricing(id);

  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Subscription pricing deleted successfully');
});

/**
 * Controller function to retrieve subscription pricing by plan ID.
 *
 * @param {Request} req - The request object containing the subscription plan ID.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<ISubscriptionPricing[]>} - The subscription pricing for the given plan.
 */
export const getPricingByPlan = catchAsync(async (req: Request, res: Response) => {
  let { planId } = req.params; // Getting the planId from URL params

  // If planId is an array, extract the first element as a string
  if (Array.isArray(planId)) {
    planId = planId[0];
  }

  const result = await subscriptionPricingServices.getPricingByPlan(planId);

  // Send a success response with the subscription pricing data
  ServerResponse(res, true, 200, 'Subscription pricing retrieved successfully', result);
});
