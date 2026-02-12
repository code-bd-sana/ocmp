import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionChangeRequestType {
  UPGRADE = 'UPGRADE',
  DOWNGRADE = 'DOWNGRADE',
  CUSTOMIZE = 'CUSTOMIZE',
}

export enum SubscriptionChangeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Define and export an interface representing a SubscriptionChangeRequest document
export interface ISubscriptionChangeRequest extends Document {
  userId: mongoose.Types.ObjectId;
  userSubscriptionId: mongoose.Types.ObjectId;
  subscriptionPlanId: mongoose.Types.ObjectId;
  subscriptionDurationId: mongoose.Types.ObjectId;
  requestType?: SubscriptionChangeRequestType;
  status?: SubscriptionChangeRequestStatus;
  requestedAt?: Date;
  processedAt?: Date;
}

// Define the SubscriptionChangeRequest schema
const SubscriptionChangeRequestSchema: Schema<ISubscriptionChangeRequest> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    userSubscriptionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'UserSubscription', // Reference to the UserSubscription model
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
    requestType: {
      type: String,
      enum: Object.values(SubscriptionChangeRequestType),
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionChangeRequestStatus),
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionChangeRequest model
const SubscriptionChangeRequest = mongoose.model<ISubscriptionChangeRequest>(
  'SubscriptionChangeRequest',
  SubscriptionChangeRequestSchema
);

// Export the SubscriptionChangeRequest model
export default SubscriptionChangeRequest;
