import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a Driver document
export interface IDriver extends Document {
  fullName: string;
  licenceNumber: string;
  postCode: string;
  niNumber: string;
  licenceExpiry?: Date;
  licenceExpiryDTC?: Date;
  cpcExpiry?: Date;
  points: Number;
  endorsementCodes: string[];
  lastChecked?: Date;
  checkFrequencyDays: Number;
  nextCheckDueDate: Date;
  employed: Boolean;
  checkStatus?: string;
  attachments?: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
}

// Define the Vehicle schema
const DriverSchema: Schema<IDriver> = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    licenceNumber: {
      type: String,
      required: true,
    },
    postCode: {
      type: String,
      required: true,
    },
    niNumber: {
      type: String,
      required: true,
    },
    licenceExpiry: {
      type: Date,
    },
    licenceExpiryDTC: {
      type: Date,
    },
    cpcExpiry: {
      type: Date,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    endorsementCodes: [
      {
        type: String,
      },
    ],
    lastChecked: {
      type: Date,
    },
    checkFrequencyDays: {
      type: Number,
      required: true,
      default: 0,
    },
    nextCheckDueDate: {
      type: Date,
      required: true,
    },
    employed: {
      type: Boolean,
      required: true,
      default: false,
    },
    checkStatus: {
      type: String,
      enum: ['Okay', 'Due'],
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document', // Reference to the Document model
      },
    ] /* Driver details, licence and doc files */,
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the Vehicle model
const Driver = mongoose.model<IDriver>('Driver', DriverSchema);

// Export the Vehicle model
export default Driver;
