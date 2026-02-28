import mongoose, { Document, Schema } from 'mongoose';

// status can be In Progress, Completed, Pending Enum
export enum AuditStatus {
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  PENDING = 'Pending',
}

// Define and export an interface representing a AuditsAndRecificationReports document
export interface IAuditsAndRecificationReport extends Document {
  auditDate: Date;
  title: string;
  type?: string;
  auditDetails?: string;
  status?: AuditStatus;
  responsiblePerson?: string;
  finalizeDate?: Date;
  attachments?: mongoose.Types.ObjectId[];
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the AuditsAndRecificationReports schema
const AuditsAndRecificationReportSchema: Schema<IAuditsAndRecificationReport> = new Schema(
  {
    auditDate: {
      type: Date,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    auditDetails: {
      type: String,
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

// Create the AuditsAndRecificationReports model
const AuditsAndRecificationReport = mongoose.model<IAuditsAndRecificationReport>(
  'AuditsAndRecificationReport',
  AuditsAndRecificationReportSchema
);

// Export the AuditsAndRecificationReports model
export default AuditsAndRecificationReport;
