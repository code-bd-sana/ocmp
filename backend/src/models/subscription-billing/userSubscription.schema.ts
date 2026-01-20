import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a UserSubscription document
export interface IUserSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionPlanId: mongoose.Types.ObjectId;
  subscriptionDurationId?: mongoose.Types.ObjectId;
  subscriptionPricingId?: mongoose.Types.ObjectId;
  status: string;
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
      required: true,
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
      enum: ['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'],
      required: true,
      default: 'ACTIVE',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
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
