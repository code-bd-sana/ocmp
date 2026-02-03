import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionDuration document
export interface ISubscriptionDuration extends Document {
  name: string;
  durationInDays: number;
  isActive?: boolean;
  createdBy: mongoose.Types.ObjectId;
}

// Define the SubscriptionDuration schema
const SubscriptionDurationSchema: Schema<ISubscriptionDuration> = new Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    durationInDays: {
      type: Number,
      required: true,
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

// Create the SubscriptionDuration model
const SubscriptionDuration = mongoose.model<ISubscriptionDuration>(
  'SubscriptionDuration',
  SubscriptionDurationSchema
);

// Export the SubscriptionDuration model
export default SubscriptionDuration;
