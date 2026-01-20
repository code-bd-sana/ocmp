import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionFeature document
export interface ISubscriptionFeature extends Document {
  code: string;
  name: string;
  description: string;
  isCoreFeature: boolean;
  createdBy: mongoose.Types.ObjectId;
}

// Define the SubscriptionFeature schema
const SubscriptionFeatureSchema: Schema<ISubscriptionFeature> = new Schema(
  {
    code: {
      type: String,
      required: true,
    } /* Feature identifier */,
    name: {
      type: String,
      required: true,
    } /* Feature name */,
    description: {
      type: String,
      required: true,
    },
    isCoreFeature: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionFeature model
const SubscriptionFeature = mongoose.model<ISubscriptionFeature>(
  'SubscriptionFeature',
  SubscriptionFeatureSchema
);

// Export the SubscriptionFeature model
export default SubscriptionFeature;
