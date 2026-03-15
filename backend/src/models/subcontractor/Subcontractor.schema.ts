import mongoose, { Document, Schema } from 'mongoose';

/** Interface representing a SubcontractorSheet document */
export interface ISubContractor extends Document {
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: Date;
  gitPolicyNumber?: string;
  gitExpiryDate?: Date;
  gitCover?: Number;
  hiabAvailable?: Boolean;
  otherCapabilities?: string;
  startDateOfAgreement?: Date;
  rating?: Number;
  standAloneId?: mongoose.Types.ObjectId;
  checkedBy?: String;
  createdBy: mongoose.Types.ObjectId;
}

// Define the SubcontractorSheet schema
const SubContractorSchema: Schema<ISubContractor> = new Schema(
  {
    insurancePolicyNumber: {
      type: String,
    },
    insuranceExpiryDate: {
      type: Date,
    },
    gitPolicyNumber: {
      type: Date,
    },
    gitExpiryDate: {
      type: Date,
    },
    gitCover: {
      type: Number,
      default: 0,
    } /* per ton */,
    hiabAvailable: {
      type: Boolean,
    },
    otherCapabilities: {
      type: String,
    },
    startDateOfAgreement: {
      type: Date,
    },
    rating: {
      type: Number,
      default: 0,
      max: 1,
    } /* RATING(1-5) */,
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference from StandAlone model
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
    checkedBy: {
      type: String,
      // required: true,
      // ref: 'User', // Reference from User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Indexes for efficient lookup
SubContractorSchema.index({ createdBy: 1 });
SubContractorSchema.index({ standAloneId: 1 });

// Create the SubcontractorSheet model
const SubContractor = mongoose.model<ISubContractor>('SubContractor', SubContractorSchema);

// Export the SubcontractorSheet model
export default SubContractor;

