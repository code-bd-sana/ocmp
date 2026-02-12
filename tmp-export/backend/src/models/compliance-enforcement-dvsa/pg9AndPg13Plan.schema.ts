import mongoose, { Document, Schema } from 'mongoose';

export enum PG9AndPG13IssueType {
  PG9 = 'PG9',
  DV79D = 'DV79D',
}

// Define and export an interface representing a pg9AndPg13Plan document
export interface Ipg9AndPg13Plan extends Document {
  vehicleId: mongoose.Types.ObjectId;
  issueType: PG9AndPG13IssueType;
  defectDescription?: string;
  clearanceStatus?: string;
  tcContactMade?: boolean;
  maintenanceProvider?: string;
  meetingDate?: Date;
  notes?: string;
  followUp?: boolean;
  createdBy: mongoose.Types.ObjectId;
}

// Define the pg9AndPg13Plan schema
const pg9AndPg13PlanSchema: Schema<Ipg9AndPg13Plan> = new Schema(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle', // Reference from Vehicle model
    },
    issueType: {
      type: String,
      enum: Object.values(PG9AndPG13IssueType),
      required: true,
    },
    defectDescription: {
      type: String,
    },
    clearanceStatus: {
      type: String,
    },
    tcContactMade: {
      type: Boolean,
    },
    maintenanceProvider: {
      type: String,
    },
    meetingDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    followUp: {
      type: Boolean,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the pg9AndPg13Plan model
const pg9AndPg13Plan = mongoose.model<Ipg9AndPg13Plan>('pg9AndPg13Plan', pg9AndPg13PlanSchema);

// Export the pg9AndPg13Plan model
export default pg9AndPg13Plan;
