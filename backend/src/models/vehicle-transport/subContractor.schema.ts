import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubContractor document
export interface ISubContractor extends Document {
  createdBy: mongoose.Types.ObjectId;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: Date;
  gitPolicyNumber?: Date;
  gitExpiryDate?: Date;
  gitCover?: Number;
  hiabAvailable?: Boolean;
  otherCapabilities?: string;
  startDateOfAgreement?: Date;
  rating?: Number;
  standAloneId?: mongoose.Types.ObjectId;
  checkedBy: mongoose.Types.ObjectId;
}

// Define the SubContractor schema
const SubContractorSchema: Schema<ISubContractor> = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
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
    checkedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubContractor model
const SubContractor = mongoose.model<ISubContractor>('SubContractor', SubContractorSchema);

// Export the SubContractor model
export default SubContractor;
