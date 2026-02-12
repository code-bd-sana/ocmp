import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionExemption document
export interface ISubscriptionExemption extends Document {
  userId: mongoose.Types.ObjectId;
  reason?: string;
  approvedBy: mongoose.Types.ObjectId;
  isPermanent?: boolean;
  startDate?: Date;
  endDate?: Date;
}

// Define the SubscriptionExemption schema
const SubscriptionExemptionSchema: Schema<ISubscriptionExemption> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    reason: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    isPermanent: {
      type: Boolean,
      required: true,
      default: false,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionExemption model
const SubscriptionExemption = mongoose.model<ISubscriptionExemption>(
  'SubscriptionExemption',
  SubscriptionExemptionSchema
);

// Export the SubscriptionExemption model
export default SubscriptionExemption;
