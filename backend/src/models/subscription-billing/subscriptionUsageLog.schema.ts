import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionUsageLog document
export interface ISubscriptionUsageLog extends Document {
  userSubscriptionId: mongoose.Types.ObjectId;
  subscriptionFeatureId: mongoose.Types.ObjectId;
  usageCount?: number;
  lastUsedAt?: Date;
}

// Define the SubscriptionUsageLog schema
const SubscriptionUsageLogSchema: Schema<ISubscriptionUsageLog> = new Schema(
  {
    userSubscriptionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'UserSubscription', // Reference to the UserSubscription model
    },
    subscriptionFeatureId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'SubscriptionFeature', // Reference to the SubscriptionFeature model
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionUsageLog model
const SubscriptionUsageLog = mongoose.model<ISubscriptionUsageLog>(
  'SubscriptionUsageLog',
  SubscriptionUsageLogSchema
);

// Export the SubscriptionUsageLog model
export default SubscriptionUsageLog;
