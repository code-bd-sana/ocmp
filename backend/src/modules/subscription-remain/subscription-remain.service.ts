import mongoose from 'mongoose';
import UserSubscription, {
  SubscriptionStatus,
} from '../../models/subscription-billing/userSubscription.schema';

/**
 * Get remaining subscription days for a user.
 * @param userId string - Mongo user id
 * @returns { daysRemaining: number, expired: boolean, startDate?: Date, endDate?: Date }
 */
export const getSubscriptionRemainingDays = async (userId: string) => {
  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid user id');
  // Find active subscription for the user
  const subscription = await UserSubscription.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
  })
    .lean()
    .sort({ createdAt: -1 }); // Get the most recent subscription
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
    subscriptionId: subscription._id,
  };
};
