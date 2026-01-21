import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a AuditsAndRecificationReports document
export interface IAuditsAndRecificationReports extends Document {
  title: string;
  type?: string;
  responsiblePerson?: string;
  attachments?: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
}

// Define the AuditsAndRecificationReports schema
const AuditsAndRecificationReportsSchema: Schema<IAuditsAndRecificationReports> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    responsiblePerson: {
      type: String,
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document', // Reference from Document model
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the AuditsAndRecificationReports model
const AuditsAndRecificationReports = mongoose.model<IAuditsAndRecificationReports>(
  'AuditsAndRecificationReports',
  AuditsAndRecificationReportsSchema
);

// Export the AuditsAndRecificationReports model
export default AuditsAndRecificationReports;
