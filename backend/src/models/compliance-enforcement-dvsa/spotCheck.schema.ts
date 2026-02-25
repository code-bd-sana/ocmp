import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SpotCheck document
export interface ISpotCheck extends Document {
  vehicleId: mongoose.Types.ObjectId;
  issueDetails: string;
  reportedBy: mongoose.Types.ObjectId;
  rectificationRequired?: Date;
  actionTaken?: string;
  dateCompleted?: Date;
  completedBy?: string;
  followUpNeeded?: string;
  notes?: string;
  attachments?: mongoose.Types.ObjectId[];
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the SpotCheck schema
const SpotCheckSchema: Schema<ISpotCheck> = new Schema(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle', // Reference from Vehicle model
    },
    issueDetails: {
      type: String,
      required: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'User', // Reference from User model
    },
    rectificationRequired: {
      type: Date,
    },
    actionTaken: {
      type: String,
    },
    dateCompleted: {
      type: Date,
    },
    completedBy: {
      type: String,
    },
    followUpNeeded: {
      type: String,
    },
    notes: {
      type: String,
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document', // Reference to the Document model
      },
    ],
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SpotCheck model
const SpotCheck = mongoose.model<ISpotCheck>('SpotCheck', SpotCheckSchema);

// Export the SpotCheck model
export default SpotCheck;
