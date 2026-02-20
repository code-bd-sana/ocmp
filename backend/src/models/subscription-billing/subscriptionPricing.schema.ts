import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionPricing document
export interface ISubscriptionPricing extends Document {
  subscriptionPlanId: mongoose.Types.ObjectId;
  subscriptionDurationId: mongoose.Types.ObjectId;
  price: number;
  currency: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

// Define the SubscriptionPricing schema
const SubscriptionPricingSchema: Schema<ISubscriptionPricing> = new Schema(
  {
    subscriptionPlanId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'SubscriptionPlan', // Reference to the SubscriptionPlan model
    },
    subscriptionDurationId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'SubscriptionDuration', // Reference to the SubscriptionDuration model
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'GBP',
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionPricing model
const SubscriptionPricing = mongoose.model<ISubscriptionPricing>(
  'SubscriptionPricing',
  SubscriptionPricingSchema
);

// Export the SubscriptionPricing model
export default SubscriptionPricing;
