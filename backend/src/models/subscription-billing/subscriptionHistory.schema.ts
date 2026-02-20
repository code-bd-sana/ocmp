import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionHistory document
export interface ISubscriptionHistory extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionPlanId: mongoose.Types.ObjectId;
  subscriptionDurationId: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  changedAt: Date;
}

// Define the SubscriptionHistory schema
const SubscriptionHistorySchema: Schema<ISubscriptionHistory> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
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
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionHistory model
const SubscriptionHistory = mongoose.model<ISubscriptionHistory>(
  'SubscriptionHistory',
  SubscriptionHistorySchema
);

// Export the SubscriptionHistory model
export default SubscriptionHistory;
