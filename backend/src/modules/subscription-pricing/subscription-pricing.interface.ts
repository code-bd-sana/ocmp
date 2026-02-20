import { ObjectId } from 'mongoose';

/**
 * Type definition for subscription-pricing.
 *
 * This type defines the structure of a single subscription-pricing object.
 * @interface TSubscriptionPricing
 */
export interface TSubscriptionPricing {
  _id: string | ObjectId;
  price: number;
  currency: string;
  isActive: boolean;
  createdBy?: string | ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated / projected fields
  subscriptionPlanName: string;
  subscriptionPlanType: string;
  applicableAccountType: string;
  subscriptionPlanDescription?: string;
  subscriptionPlanStatus: boolean;

  subscriptionName: string;
  subscriptionDuration: number; // in days
  subscriptionDurationStatus: boolean;
}
