// Import the model
import mongoose from 'mongoose';

import {
  ApplicableAccountType,
  IUserSubscription,
  SubscriptionDuration,
  SubscriptionPlan,
  SubscriptionPlanType,
  SubscriptionPricing,
  SubscriptionStatus,
  UserRole,
  User,
  UserSubscription,
} from '../../models';
import { getSubscriptionRemainingDays } from '../subscription-remain/subscription-remain.service';

const TRIAL_DAYS = 7;

type TrialEligibilityResult = {
  eligible: boolean;
  reason: string;
  hasUsedTrial: boolean;
  isTrialEnabledByAdmin: boolean;
  hasActiveSubscription: boolean;
  trialDays: number;
};

const getRoleScopedAccountTypes = (role?: UserRole): ApplicableAccountType[] => {
  if (role === UserRole.STANDALONE_USER) {
    return [ApplicableAccountType.STANDALONE, ApplicableAccountType.BOTH];
  }

  if (role === UserRole.TRANSPORT_MANAGER) {
    return [ApplicableAccountType.TRANSPORT_MANAGER, ApplicableAccountType.BOTH];
  }

  return [ApplicableAccountType.BOTH];
};

const getSubscriptionTrialEligibility = async (
  userId: string,
  role?: UserRole
): Promise<TrialEligibilityResult> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user id');
  }

  const roleScopedTypes = getRoleScopedAccountTypes(role);

  const [hasUsedTrial, remaining] = await Promise.all([
    UserSubscription.exists({
      userId: new mongoose.Types.ObjectId(userId),
      isFree: true,
    }),
    getSubscriptionRemainingDays(userId),
  ]);

  const hasActiveSubscription = !remaining.expired || remaining.isLifetime;

  const trialPricingCount = await SubscriptionPricing.aggregate([
    {
      $match: {
        isActive: true,
      },
    },
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'subscriptionPlanId',
        foreignField: '_id',
        as: 'plan',
      },
    },
    { $unwind: '$plan' },
    {
      $lookup: {
        from: 'subscriptiondurations',
        localField: 'subscriptionDurationId',
        foreignField: '_id',
        as: 'duration',
      },
    },
    { $unwind: '$duration' },
    {
      $match: {
        'plan.planType': SubscriptionPlanType.FREE,
        'plan.isActive': true,
        'plan.applicableAccountType': { $in: roleScopedTypes },
        'duration.isActive': true,
      },
    },
    { $limit: 1 },
    { $count: 'count' },
  ]);

  const isTrialEnabledByAdmin = Boolean(trialPricingCount[0]?.count);

  if (!isTrialEnabledByAdmin) {
    return {
      eligible: false,
      reason: 'Trial is currently disabled by admin.',
      hasUsedTrial: Boolean(hasUsedTrial),
      isTrialEnabledByAdmin,
      hasActiveSubscription,
      trialDays: TRIAL_DAYS,
    };
  }

  if (hasUsedTrial) {
    return {
      eligible: false,
      reason: 'Trial has already been used. It can only be claimed once.',
      hasUsedTrial: true,
      isTrialEnabledByAdmin,
      hasActiveSubscription,
      trialDays: TRIAL_DAYS,
    };
  }

  if (hasActiveSubscription) {
    return {
      eligible: false,
      reason: 'You already have an active subscription or trial.',
      hasUsedTrial: false,
      isTrialEnabledByAdmin,
      hasActiveSubscription: true,
      trialDays: TRIAL_DAYS,
    };
  }

  return {
    eligible: true,
    reason: `Eligible for one-time ${TRIAL_DAYS}-day trial.`,
    hasUsedTrial: false,
    isTrialEnabledByAdmin,
    hasActiveSubscription: false,
    trialDays: TRIAL_DAYS,
  };
};

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

  const user = await User.findById(data.userId).select('role').lean();
  const eligibility = await getSubscriptionTrialEligibility(data.userId, user?.role as UserRole);
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason);
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
  endDate.setDate(endDate.getDate() + TRIAL_DAYS);
  data = {
    ...data,
    startDate: newDate,
    endDate: endDate,
    status: SubscriptionStatus.TRIAL, // Set status to TRIAL
  };
  // Proceed to create the subscription-trial
  const newSubscriptionTrial = new UserSubscription(data);
  // Save to database
  const savedSubscriptionTrial = await newSubscriptionTrial.save();
  return savedSubscriptionTrial;
};

export const subscriptionTrialServices = {
  createSubscriptionTrial,
  getSubscriptionTrialEligibility,
};
