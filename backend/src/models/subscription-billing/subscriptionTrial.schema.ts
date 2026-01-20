import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionTrial document
export interface ISubscriptionTrial extends Document {
  userId: mongoose.Types.ObjectId;
  trialDays: number;
  startDate: Date;
  endDate: Date;
  isUsed: boolean;
  convertedToPaid?: boolean;
}

// Define the SubscriptionTrial schema
const SubscriptionTrialSchema: Schema<ISubscriptionTrial> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    trialDays: {
      type: Number,
      required: true,
      default: 7,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      required: true,
      default: false,
    },
    convertedToPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionTrial model
const SubscriptionTrial = mongoose.model<ISubscriptionTrial>(
  'SubscriptionTrial',
  SubscriptionTrialSchema
);

// Export the SubscriptionTrial model
export default SubscriptionTrial;
