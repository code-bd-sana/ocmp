import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionCustomization document
export interface ISubscriptionCustomization extends Document {
  userSubscriptionId: mongoose.Types.ObjectId;
  subscriptionFeatureId: mongoose.Types.ObjectId;
  isEnabled: boolean;
}

// Define the SubscriptionCustomization schema
const SubscriptionCustomizationSchema: Schema<ISubscriptionCustomization> = new Schema(
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
    isEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionCustomization model
const SubscriptionCustomization = mongoose.model<ISubscriptionCustomization>(
  'SubscriptionCustomization',
  SubscriptionCustomizationSchema
);

// Export the SubscriptionCustomization model
export default SubscriptionCustomization;
