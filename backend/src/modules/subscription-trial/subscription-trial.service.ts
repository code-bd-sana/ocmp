// Import the model
import mongoose from 'mongoose';

import config from '../../config/config';
import {
  IUserSubscription,
  SubscriptionDuration,
  SubscriptionPlan,
  SubscriptionPlanType,
  SubscriptionPricing,
  SubscriptionStatus,
  User,
  UserSubscription,
} from '../../models';

/**
 * Service function to create a new subscription-trial.
 *
 * @param {CreateSubscriptionTrialInput} data - The data to create a new subscription-trial.
 * @returns {Promise<Partial<IUserSubscription>>} - The created subscription-trial.
 */
const createSubscriptionTrial = async (
  data: Partial<IUserSubscription> & { userId: string }
): Promise<Partial<IUserSubscription>> => {
  if (!mongoose.Types.ObjectId.isValid(data.userId)) {
    throw new Error('Invalid user id');
  }

  const userExists = await User.exists({ _id: new mongoose.Types.ObjectId(data.userId) });
  if (!userExists) {
    throw new Error('User not found');
  }

  if (!data.subscriptionPricingId && !data.subscriptionPlanId) {
    throw new Error('Subscription pricing or plan is required to start trial');
  }

  // If pricing id is provided, auto-map trial with that plan + duration combination.
  if (data.subscriptionPricingId) {
    const pricing = await SubscriptionPricing.findById(data.subscriptionPricingId).lean();
    if (!pricing) {
      throw new Error('Subscription-pricing not found');
    }

    if (!pricing.isActive) {
      throw new Error('This trial pricing is not active currently');
    }

    const [plan, duration] = await Promise.all([
      SubscriptionPlan.findById(pricing.subscriptionPlanId).lean(),
      SubscriptionDuration.findById(pricing.subscriptionDurationId).lean(),
    ]);

    if (!plan || !plan.isActive || plan.planType !== SubscriptionPlanType.FREE) {
      throw new Error('Trial is only available for active FREE plans created by admin');
    }

    if (!duration || !duration.isActive) {
      throw new Error('Selected trial duration is not active currently');
    }

    data.subscriptionPlanId = pricing.subscriptionPlanId;
    data.subscriptionDurationId = pricing.subscriptionDurationId;
    data.isFree = true;
  } else if (data.subscriptionPlanId) {
    const plan = await SubscriptionPlan.findById(data.subscriptionPlanId).lean();
    if (!plan || !plan.isActive || plan.planType !== SubscriptionPlanType.FREE) {
      throw new Error('Trial is only available for active FREE plans created by admin');
    }

    if (data.subscriptionDurationId) {
      const duration = await SubscriptionDuration.findById(data.subscriptionDurationId).lean();
      if (!duration || !duration.isActive) {
        throw new Error('Selected trial duration is not active currently');
      }
    }

    data.isFree = true;
  }

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
    status: SubscriptionStatus.TRIAL, // Set status to TRIAL
  };
  // Check for existing active trial for the user and subscription
  const existingSubscriptionTrial = await UserSubscription.findOne({
    userId: new mongoose.Types.ObjectId(data.userId),
    status: { $in: [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE] },
  }).lean();
  // Only allow one active trial per user. If an active trial already exists, throw an error
  if (existingSubscriptionTrial) {
    throw new Error('An active or trial subscription already exists for this user');
  }
  // Proceed to create the subscription-trial
  const newSubscriptionTrial = new UserSubscription(data);
  // Save to database
  const savedSubscriptionTrial = await newSubscriptionTrial.save();
  return savedSubscriptionTrial;
};

export const subscriptionTrialServices = {
  createSubscriptionTrial,
};
