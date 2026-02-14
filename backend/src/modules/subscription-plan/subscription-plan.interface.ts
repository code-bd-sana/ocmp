// subscription-plan.interface.ts
import mongoose, { Document } from 'mongoose';
import { ApplicableAccountType, SubscriptionPlanType } from '../../models';

/**
 * Interface for the SubscriptionPlan model.
 */
export interface ISubscriptionPlan extends Document {
  name: string;
  planType: SubscriptionPlanType;
  applicableAccountType?: ApplicableAccountType;
  description?: string;
  isActive?: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
