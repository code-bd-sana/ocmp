import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

// Define and export an interface representing a UserSubscription document
export interface IUserSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionPlanId: mongoose.Types.ObjectId;
  subscriptionDurationId?: mongoose.Types.ObjectId;
  subscriptionPricingId?: mongoose.Types.ObjectId;
  status: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
  autoRenew: boolean;
  isFree: boolean;
  refundable: boolean;
  refundWindowEnd?: Date;
  refundedAmount?: number;
}

// Define the UserSubscription schema
const UserSubscriptionSchema: Schema<IUserSubscription> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    subscriptionPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan', // Reference to the SubscriptionPlan model
    },
    subscriptionDurationId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionDuration', // Reference to the SubscriptionDuration model
    },
    subscriptionPricingId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPricing', // Reference to the SubscriptionPricing model
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      required: true,
      default: SubscriptionStatus.TRIAL,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date, //auto
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    refundable: {
      type: Boolean,
      required: true,
      default: false,
    },
    refundWindowEnd: {
      type: Date,
    } /* Refund eligibility end */,
    refundedAmount: {
      type: Number,
    } /* Total refunded so far */,
  },
  { timestamps: true, versionKey: false }
);

// Create the UserSubscription model
const UserSubscription = mongoose.model<IUserSubscription>(
  'UserSubscription',
  UserSubscriptionSchema
);

// Export the UserSubscription model
export default UserSubscription;
