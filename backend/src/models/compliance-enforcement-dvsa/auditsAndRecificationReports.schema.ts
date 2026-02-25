import mongoose, { Document, Schema } from 'mongoose';

// status can be In Progress, Completed, Pending Enum
export enum AuditStatus {
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  PENDING = 'Pending',
}

// Define and export an interface representing a AuditsAndRectificationReports document
export interface IAuditsAndRectificationReports extends Document {
  auditDate: Date;
  auditTitle: string;
  status?: AuditStatus;
  responsiblePerson?: string;
  finalizeDate?: Date;
  attachments?: mongoose.Types.ObjectId[];
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the AuditsAndRectificationReports schema
const AuditsAndRectificationReportsSchema: Schema<IAuditsAndRectificationReports> = new Schema(
  {
    auditDate: {
      type: Date,
      required: true,
    },
    auditTitle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AuditStatus),
      default: AuditStatus.PENDING,
    },
    responsiblePerson: {
      type: String,
    },
    finalizeDate: {
      type: Date,
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document', // Reference from Document model
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

// Create the AuditsAndRectificationReports model
const AuditsAndRectificationReports = mongoose.model<IAuditsAndRectificationReports>(
  'AuditsAndRectificationReports',
  AuditsAndRectificationReportsSchema
);

// Export the AuditsAndRectificationReports model
export default AuditsAndRectificationReports;
