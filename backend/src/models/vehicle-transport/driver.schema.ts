import mongoose, { Document, Schema } from 'mongoose';

export enum CheckStatus {
  OKAY = 'Okay',
  DUE = 'Due',
}

// Define and export an interface representing a Driver document
export interface IDriver extends Document {
  fullName: string;
  licenseNumber: string;
  postCode: string;
  niNumber: string;
  licenseExpiry?: Date;
  licenseExpiryDTC?: Date;
  cpcExpiry?: Date;
  points: Number;
  endorsementCodes: string[];
  lastChecked?: Date;
  checkFrequencyDays: Number;
  nextCheckDueDate: Date;
  employed: Boolean;
  checkStatus?: CheckStatus;
  attachments?: mongoose.Types.ObjectId[];
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the Vehicle schema
const DriverSchema: Schema<IDriver> = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    licenseNumber: {
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
    licenseExpiry: {
      type: Date,
    },
    licenseExpiryDTC: {
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
      enum: Object.values(CheckStatus),
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document', // Reference to the Document model
      },
    ] /* Driver details, licence and doc files */,
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Which Standalone or client employed this driver
    },
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
