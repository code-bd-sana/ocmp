import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a RenewalTracker document
export interface IRenewalTracker extends Document {
  type: string;
  item: string;
  description?: string;
  refOrPolicyNo?: string;
  providerOrIssuer?: string;
  startDate?: Date;
  expiryOrDueDate?: Date;
  reminderSet?: Boolean;
  reminderDate?: Date;
  status?: Boolean;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
}

// Define the RenewalTracker schema
const RenewalTrackerSchema: Schema<IRenewalTracker> = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    item: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    refOrPolicyNo: {
      type: String,
    },
    providerOrIssuer: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    expiryOrDueDate: {
      type: Date,
    },
    reminderSet: {
      type: Boolean,
    },
    reminderDate: {
      type: Date,
    },
    status: {
      type: Boolean,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the RenewalTracker model
const RenewalTracker = mongoose.model<IRenewalTracker>('RenewalTracker', RenewalTrackerSchema);

// Export the RenewalTracker model
export default RenewalTracker;
