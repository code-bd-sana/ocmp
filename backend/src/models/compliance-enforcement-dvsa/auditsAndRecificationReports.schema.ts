import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a AuditsAndRectificationReports document
export interface IAuditsAndRectificationReports extends Document {
  title: string;
  type?: string;
  responsiblePerson?: string;
  attachments?: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
}

// Define the AuditsAndRectificationReports schema
const AuditsAndRectificationReportsSchema: Schema<IAuditsAndRectificationReports> = new Schema(
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

// Create the AuditsAndRectificationReports model
const AuditsAndRectificationReports = mongoose.model<IAuditsAndRectificationReports>(
  'AuditsAndRectificationReports',
  AuditsAndRectificationReportsSchema
);

// Export the AuditsAndRectificationReports model
export default AuditsAndRectificationReports;
