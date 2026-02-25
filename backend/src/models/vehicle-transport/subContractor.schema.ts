import mongoose, { Document, Schema } from 'mongoose';

/** Interface representing a SubContractor document */
export interface ISubContractor extends Document {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: Date;
  gitPolicyNumber?: string;
  gitExpiryDate?: Date;
  gitCoverPerTonne?: number;
  hiabAvailable: boolean;
  otherCapabilities?: string;
  startDateOfAgreement: Date;
  rating?: number;
  checkedBy: string;
  notes?: string;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const SubContractorSchema: Schema<ISubContractor> = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    } /* Name of the sub-contractor company */,
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    } /* Primary contact person */,
    phone: {
      type: String,
      required: true,
      trim: true,
    } /* Contact phone number */,
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    } /* Contact email */,
    insurancePolicyNumber: {
      type: String,
      required: true,
      trim: true,
    } /* Insurance policy number */,
    insuranceExpiryDate: {
      type: Date,
      required: true,
    } /* Insurance expiry date */,
    gitPolicyNumber: {
      type: String,
      trim: true,
    } /* Goods In Transit policy number */,
    gitExpiryDate: {
      type: Date,
    } /* GIT expiry date */,
    gitCoverPerTonne: {
      type: Number,
    } /* GIT cover amount per tonne */,
    hiabAvailable: {
      type: Boolean,
      default: false,
    } /* Whether HIAB is available */,
    otherCapabilities: {
      type: String,
      trim: true,
    } /* Other capabilities / services */,
    startDateOfAgreement: {
      type: Date,
      required: true,
    } /* Date the agreement started */,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    } /* Rating from 1 to 5 */,
    checkedBy: {
      type: String,
      required: true,
      trim: true,
    } /* Name of person who checked */,
    notes: {
      type: String,
      trim: true,
    } /* Additional notes */,
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    } /* Optional: the standalone user (client) this belongs to */,
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    } /* The user who created this record */,
  },
  { timestamps: true, versionKey: false }
);

// Indexes for access-control queries
SubContractorSchema.index({ createdBy: 1 });
SubContractorSchema.index({ standAloneId: 1 });

const SubContractor = mongoose.model<ISubContractor>('SubContractor', SubContractorSchema);

export default SubContractor;
