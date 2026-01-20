import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionStatusLog document
export interface ISubscriptionStatusLog extends Document {
  userSubscriptionId: mongoose.Types.ObjectId;
  oldStatus?: string;
  newStatus?: string;
  changedBy: mongoose.Types.ObjectId;
  changedAt?: Date;
}

// Define the SubscriptionStatusLog schema
const SubscriptionStatusLogSchema: Schema<ISubscriptionStatusLog> = new Schema(
  {
    userSubscriptionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'UserSubscription', // Reference to the UserSubscription model
    },
    oldStatus: {
      type: String,
    },
    newStatus: {
      type: String,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    changedAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionStatusLog model
const SubscriptionStatusLog = mongoose.model<ISubscriptionStatusLog>(
  'SubscriptionStatusLog',
  SubscriptionStatusLogSchema
);

// Export the SubscriptionStatusLog model
export default SubscriptionStatusLog;
