import mongoose from 'mongoose';
import {
  ClientManagement,
  ClientStatus,
  SubscriptionStatus,
  User,
  UserRole,
  UserSubscription,
} from '../../models';

type PopulatedSubscriptionRef = {
  _id?: mongoose.Types.ObjectId | string;
  name?: string;
  planType?: string;
  applicableAccountType?: string;
  durationInDays?: number;
  price?: number;
  currency?: string;
};

type PopulatedSubscription = {
  _id: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  subscriptionPlanId?: mongoose.Types.ObjectId | string | PopulatedSubscriptionRef;
  subscriptionDurationId?: mongoose.Types.ObjectId | string | PopulatedSubscriptionRef;
  subscriptionPricingId?: mongoose.Types.ObjectId | string | PopulatedSubscriptionRef;
};

type AccessSource = 'SUBSCRIPTION' | 'ASSIGNED_MANAGER' | 'NONE';

const isPopulatedRef = (
  value: mongoose.Types.ObjectId | string | PopulatedSubscriptionRef | undefined
): value is PopulatedSubscriptionRef => {
  if (!value) return false;

  if (typeof value === 'string') return false;

  return !(value instanceof mongoose.Types.ObjectId);
};

const getRefIdString = (
  value: mongoose.Types.ObjectId | string | PopulatedSubscriptionRef | undefined
) => {
  if (!value) return undefined;

  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (value._id instanceof mongoose.Types.ObjectId) {
    return value._id.toString();
  }

  if (typeof value._id === 'string') {
    return value._id;
  }

  return undefined;
};

/**
 * Get remaining subscription days for a user.
 * @param userId string - Mongo user id
 * @returns { daysRemaining: number; expired: boolean; isLifetime: boolean; startDate: Date | undefined; endDate: Date | undefined; subscriptionId: string | undefined  }
 */
export const getSubscriptionRemainingDays = async (userId: string) => {
  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid user id');

  const currentUser = await User.findById(userId).select('role').lean();
  const hasApprovedManagerAssignment =
    currentUser?.role === UserRole.STANDALONE_USER
      ? Boolean(
          await ClientManagement.findOne({
            'clients.clientId': new mongoose.Types.ObjectId(userId),
            'clients.status': ClientStatus.APPROVED,
          })
            .select('_id')
            .lean()
        )
      : false;

  // Find active subscription for the user
  const subscription = await UserSubscription.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
  })
    .populate('subscriptionPlanId', 'name planType applicableAccountType')
    .populate('subscriptionDurationId', 'name durationInDays')
    .populate('subscriptionPricingId', 'price currency')
    .lean()
    .sort({ createdAt: -1 }) // most recent first
    .exec();

  const populatedSubscription = subscription as unknown as PopulatedSubscription | null;

  const planInfo = isPopulatedRef(populatedSubscription?.subscriptionPlanId)
    ? populatedSubscription?.subscriptionPlanId
    : undefined;

  const durationInfo = isPopulatedRef(populatedSubscription?.subscriptionDurationId)
    ? populatedSubscription?.subscriptionDurationId
    : undefined;

  const pricingInfo = isPopulatedRef(populatedSubscription?.subscriptionPricingId)
    ? populatedSubscription?.subscriptionPricingId
    : undefined;

  const activePlan =
    populatedSubscription && planInfo
      ? {
          subscriptionPlanId: getRefIdString(populatedSubscription.subscriptionPlanId),
          subscriptionDurationId: getRefIdString(populatedSubscription.subscriptionDurationId),
          subscriptionPricingId: getRefIdString(populatedSubscription.subscriptionPricingId),
          planName: planInfo.name,
          planType: planInfo.planType,
          accountType: planInfo.applicableAccountType,
          durationName: durationInfo?.name,
          durationInDays: durationInfo?.durationInDays,
          price: pricingInfo?.price,
          currency: pricingInfo?.currency,
        }
      : undefined;

  const accessGranted =
    hasApprovedManagerAssignment ||
    Boolean(
      populatedSubscription &&
      (!populatedSubscription.endDate || populatedSubscription.endDate > new Date())
    );

  const accessSource: AccessSource = hasApprovedManagerAssignment
    ? 'ASSIGNED_MANAGER'
    : populatedSubscription
      ? 'SUBSCRIPTION'
      : 'NONE';

  // No active subscription at all
  if (!populatedSubscription) {
    return {
      daysRemaining: 0,
      expired: true,
      isLifetime: false,
      startDate: undefined,
      endDate: undefined,
      subscriptionId: undefined,
      activePlan: undefined,
      accessGranted,
      accessSource,
    };
  }
  // Calculate remaining days
  const now = new Date();
  // Lifetime subscription
  if (!populatedSubscription.endDate) {
    return {
      daysRemaining: Infinity,
      expired: false,
      isLifetime: true,
      startDate: populatedSubscription.startDate,
      endDate: undefined,
      subscriptionId: populatedSubscription._id.toString(),
      activePlan,
      accessGranted,
      accessSource,
    };
  }
  // Subscription with end date
  const diffMs = populatedSubscription.endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const expired = diffMs <= 0;
  return {
    daysRemaining,
    expired,
    isLifetime: false,
    startDate: populatedSubscription.startDate,
    endDate: populatedSubscription.endDate,
    subscriptionId: populatedSubscription._id.toString(),
    activePlan,
    accessGranted,
    accessSource,
  };
};
