// Import the model
import mongoose from 'mongoose';

import config from '../../config/config';
import { IdOrIdsInput } from '../../handlers/common-zod-validator';
import UserSubscription, {
  IUserSubscription,
  SubscriptionStatus,
} from '../../models/subscription-billing/userSubscription.schema';
import { CreateSubscriptionTrialInput } from './subscription-trial.validation';

/**
 * Service function to create a new subscription-trial.
 *
 * @param {CreateSubscriptionTrialInput} data - The data to create a new subscription-trial.
 * @returns {Promise<Partial<IUserSubscription>>} - The created subscription-trial.
 */
const createSubscriptionTrial = async (
  data: Partial<IUserSubscription> & { userId: string }
): Promise<Partial<IUserSubscription>> => {
  // Set trial start and end dates
  const newDate = new Date();
  // Set time for consistency
  const endDate = new Date(newDate);
  // Set time to end of the day
  endDate.setDate(endDate.getDate() + config.SUBSCRIPTION_TRIAL_DAYS); // Add trial days from config
  data = {
    ...data,
    startDate: newDate,
    endDate: endDate,
    status: 'TRIAL',
  };
  // Check for existing active trial for the user and subscription
  const existingSubscriptionTrial = await UserSubscription.findOne({
    userId: data.userId,
  }).lean();
  // Prevent duplicate trials
  if (existingSubscriptionTrial) {
    throw new Error(
      'Duplicate detected: An active subscription-trial for this user and subscription already exists.'
    );
  }
  // Proceed to create the subscription-trial
  const newSubscriptionTrial = new UserSubscription(data);
  // Save to database
  const savedSubscriptionTrial = await newSubscriptionTrial.save();
  return savedSubscriptionTrial;
};

/**
 * Service function to delete a single subscription-trial by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-trial to delete.
 * @returns {Promise<Partial<IUserSubscription>>} - The deleted subscription-trial.
 */
const deleteSubscriptionTrial = async (
  id: IdOrIdsInput['id']
): Promise<Partial<IUserSubscription | null>> => {
  const deletedSubscriptionTrial = await UserSubscription.findByIdAndDelete(id);
  return deletedSubscriptionTrial;
};

/**
 * Service function to retrieve a single subscription-trial by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-trial to retrieve.
 * @returns {Promise<Partial<IUserSubscription | null>>} - The retrieved subscription-trial.
 */
const getSubscriptionTrialById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<IUserSubscription | null>> => {
  const subscriptionTrial = await UserSubscription.findById(id);
  return subscriptionTrial;
};

/**
 * Get remaining trial days for a user.
 * @param userId string - Mongo user id
 * @returns { daysRemaining: number, expired: boolean, startDate?: Date, endDate?: Date }
 */
export const getTrialRemainingDays = async (userId: string) => {
  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid user id');
  // Find active trial subscription for the user
  const subscription = await UserSubscription.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    status: SubscriptionStatus.TRIAL,
  }).lean();
  // If no active trial found
  if (!subscription || !subscription.endDate) {
    return { daysRemaining: 0, expired: true };
  }
  // Calculate remaining days
  const now = new Date();
  const diffMs = subscription.endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const expired = diffMs <= 0;
  return {
    daysRemaining: expired ? 0 : daysRemaining,
    expired,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    subscriptionId: subscription._id?.toString?.(),
  };
};

export const subscriptionTrialServices = {
  createSubscriptionTrial,
  deleteSubscriptionTrial,
  getSubscriptionTrialById,
  getTrialRemainingDays,
};
