import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionPlanType {
  FREE = 'FREE',
  PAID = 'PAID',
  CUSTOM = 'CUSTOM',
}

export enum ApplicableAccountType {
  STANDALONE = 'STANDALONE',
  TRANSPORT_MANAGER = 'TRANSPORT_MANAGER',
  BOTH = 'BOTH',
}

// Define and export an interface representing a SubscriptionPlan document
export interface ISubscriptionPlan extends Document {
  name: string;
  planType: SubscriptionPlanType;
  applicableAccountType?: ApplicableAccountType;
  description?: string;
  isActive?: boolean;
  createdBy: mongoose.Types.ObjectId;
}

// Define the SubscriptionBilling schema
const SubscriptionPlanSchema: Schema<ISubscriptionPlan> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      toUpperCase: true,
    },
    planType: {
      type: String,
      enum: Object.values(SubscriptionPlanType),
      required: true,
      default: SubscriptionPlanType.PAID,
    },
    applicableAccountType: {
      type: String,
      enum: Object.values(ApplicableAccountType),
      required: true,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
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

// Create the SubscriptionPlan model
const SubscriptionPlan = mongoose.model<ISubscriptionPlan>(
  'SubscriptionPlan',
  SubscriptionPlanSchema
);

// Export the SubscriptionPlan model
export default SubscriptionPlan;
