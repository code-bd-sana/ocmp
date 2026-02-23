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
  standAloneId?: mongoose.Types.ObjectId;
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

// Create the ComplianceTimeTable model
const ComplianceTimeTable = mongoose.model<IComplianceTimeTable>(
  'ComplianceTimeTable',
  ComplianceTimeTableSchema
);

// Export the ComplianceTimeTable model
export default ComplianceTimeTable;
