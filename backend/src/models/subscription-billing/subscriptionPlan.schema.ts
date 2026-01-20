import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionPlan document
export interface ISubscriptionPlan extends Document {
  name: string;
  planType: 'FREE' | 'PAID' | 'CUSTOM';
  applicableAccountType?: 'STANDALONE' | 'TRANSPORT_MANAGER' | 'BOTH';
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
    },
    planType: {
      type: String,
      enum: ['FREE', 'PAID', 'CUSTOM'],
      required: true,
    },
    applicableAccountType: {
      type: String,
      enum: ['STANDALONE', 'TRANSPORT_MANAGER', 'BOTH'],
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
