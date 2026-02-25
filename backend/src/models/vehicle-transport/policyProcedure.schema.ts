import mongoose, { Document, Schema } from 'mongoose';

/** Interface representing a PolicyProcedure document */
export interface IPolicyProcedure extends Document {
  policyName: string;
  policyCategory: string;
  fileLocations: string[];
  versionNumber: number;
  effectiveDate: Date;
  reviewFrequencyMonths?: number;
  lastReviewDate?: Date;
  responsiblePerson: string;
  notesActionsNeeded?: string;
  nextReviewDue?: Date;
  reviewStatus: string;
  type: string;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const PolicyProcedureSchema: Schema<IPolicyProcedure> = new Schema(
  {
    policyName: {
      type: String,
      required: true,
      trim: true,
    } /* Name of the policy */,
    policyCategory: {
      type: String,
      required: true,
      trim: true,
    } /* Category of the policy */,
    fileLocations: {
      type: [String],
      required: true,
      default: [],
    } /* Array of file locations / links */,
    versionNumber: {
      type: Number,
      required: true,
    } /* Version number (float, e.g. 1.0, 2.1) */,
    effectiveDate: {
      type: Date,
      required: true,
    } /* The date the policy becomes effective */,
    reviewFrequencyMonths: {
      type: Number,
    } /* How often the policy is reviewed (in months) */,
    lastReviewDate: {
      type: Date,
    } /* Date of the last review */,
    responsiblePerson: {
      type: String,
      required: true,
      trim: true,
    } /* Person responsible for this policy */,
    notesActionsNeeded: {
      type: String,
      trim: true,
    } /* Notes or actions needed */,
    nextReviewDue: {
      type: Date,
    } /* Date of the next scheduled review */,
    reviewStatus: {
      type: String,
      required: true,
      trim: true,
    } /* Current review status */,
    type: {
      type: String,
      required: true,
      trim: true,
    } /* Type of the policy/procedure */,
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
PolicyProcedureSchema.index({ createdBy: 1 });
PolicyProcedureSchema.index({ standAloneId: 1 });

const PolicyProcedure = mongoose.model<IPolicyProcedure>('PolicyProcedure', PolicyProcedureSchema);

export default PolicyProcedure;
