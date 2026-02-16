import mongoose, { Document } from 'mongoose';

/**
 * Interface representing a SubscriptionPricing document.
 */
export interface ISubscriptionPricing extends Document {
  subscriptionPlanId: mongoose.Types.ObjectId;
  subscriptionDurationId: mongoose.Types.ObjectId;
  price: number;
  currency: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}
