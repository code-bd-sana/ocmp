import mongoose, { Document, Schema } from 'mongoose';

// renewal tracker enum NO/RECOMMENDED
export enum RenewalTracker {
  NO = 'NO',
  RECOMMENDED = 'RECOMMENDED',
}

// Define and export an interface representing a TransportManagerTraining document
export interface ITransportManagerTraining extends Document {
  name: string;
  trainingCourse: string;
  unitTitle: string;
  completionDate: Date;
  renewalTracker: RenewalTracker;
  nextDueDate: Date;
  attachments: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
}

// Define the TransportManagerTraining schema
const TransportManagerTrainingSchema: Schema<ITransportManagerTraining> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    trainingCourse: {
      type: String,
      required: true,
    },
    unitTitle: {
      type: String,
      required: true,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    renewalTracker: {
      type: String,
      enum: Object.values(RenewalTracker),
      default: RenewalTracker.NO,
      required: true,
    },

    // TODO: Transport manager can upload their own document
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document', // Reference to the Document model
        required: true,
      },
    ],
    nextDueDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the TransportManagerTraining model
const TransportManagerTraining = mongoose.model<ITransportManagerTraining>(
  'TransportManagerTraining',
  TransportManagerTrainingSchema
);

// Export the TransportManagerTraining model
export default TransportManagerTraining;
