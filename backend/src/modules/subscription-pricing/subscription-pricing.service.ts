import { ISubscriptionPricing, SubscriptionPricing } from '../../models';
import {
  CreateSubscriptionPricingInput,
  UpdateSubscriptionPricingInput,
} from './subscription-pricing.validation';

/**
 * Service function to create a new subscription pricing.
 *
 * @param {CreateSubscriptionPricingInput} data - The data to create a new subscription pricing.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The created subscription pricing.
 */
const createSubscriptionPricing = async (
  data: CreateSubscriptionPricingInput
): Promise<Partial<ISubscriptionPricing>> => {
  // Prevent duplicate pricing with the same plan and duration
  const existingPricing = await SubscriptionPricing.findOne({
    subscriptionPlanId: data.subscriptionPlanId,
    subscriptionDurationId: data.subscriptionDurationId,
  });

  if (existingPricing) {
    throw new Error('Pricing for this plan and duration already exists.');
  }

  // Create and save the new subscription pricing
  const newSubscriptionPricing = new SubscriptionPricing(data);
  const savedSubscriptionPricing = await newSubscriptionPricing.save();
  return savedSubscriptionPricing;
};

/**
 * Service function to update subscription pricing by ID.
 *
 * @param {string} id - The ID of the subscription pricing to update.
 * @param {UpdateSubscriptionPricingInput} data - The data to update the subscription pricing.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The updated subscription pricing.
 */
const updateSubscriptionPricing = async (
  id: string,
  data: UpdateSubscriptionPricingInput
): Promise<Partial<ISubscriptionPricing>> => {
  // Find and update the subscription pricing
  const updatedSubscriptionPricing = await SubscriptionPricing.findByIdAndUpdate(id, data, {
    new: true, // Return the updated document
  });

  if (!updatedSubscriptionPricing) {
    throw new Error('Failed to update subscription pricing');
  }

  return updatedSubscriptionPricing;
};

/**
 * Service function to delete a subscription pricing by ID.
 *
 * @param {string} id - The ID of the subscription pricing to delete.
 * @returns {Promise<void>} - Returns nothing.
 */
const deleteSubscriptionPricing = async (id: string): Promise<void> => {
  const result = await SubscriptionPricing.findByIdAndDelete(id);

  if (!result) {
    throw new Error('Failed to delete subscription pricing');
  }
};

/**
 * Service function to retrieve subscription pricing by plan ID.
 *
 * @param {string} planId - The ID of the subscription plan to retrieve pricing for.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The list of subscription pricing for the plan.
 */
const getPricingByPlan = async (planId: string): Promise<Partial<ISubscriptionPricing>[]> => {
  const pricing = await SubscriptionPricing.find({ subscriptionPlanId: planId });

  if (!pricing) {
    throw new Error('No pricing found for this plan');
  }

  return pricing;
};

export const subscriptionPricingServices = {
  createSubscriptionPricing,
  updateSubscriptionPricing,
  deleteSubscriptionPricing,
  getPricingByPlan,
};
