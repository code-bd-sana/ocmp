import mongoose, { Document, Schema } from 'mongoose';

export enum ComplianceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// Define and export an interface representing a ComplianceTimeTable document
export interface IComplianceTimeTable extends Document {
  task: string;
  responsibleParty?: string;
  dueDate?: Date;
  status?: ComplianceStatus;
  createdBy: mongoose.Types.ObjectId;
}

// Define the ComplianceTimeTable schema
const ComplianceTimeTableSchema: Schema<IComplianceTimeTable> = new Schema(
  {
    task: {
      type: String,
      required: true,
    },
    responsibleParty: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(ComplianceStatus),
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
const ComplianceTimeTable = mongoose.model<IComplianceTimeTable>(
  'ComplianceTimeTable',
  ComplianceTimeTableSchema
);

// Export the ComplianceTimeTable model
export default ComplianceTimeTable;
