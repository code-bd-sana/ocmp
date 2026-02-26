import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a OcrsPlan document
export interface IOcrsPlan extends Document {
  roadWorthinessScore?: string;
  overallTrafficScore?: string;
  actionRequired?: string;
  documents?: {
    textDoc: {
      label: string;
      description: string;
    }[];
    attachments: mongoose.Types.ObjectId[];
  }[];
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the OcrsPlan schema
const OcrsPlanSchema: Schema<IOcrsPlan> = new Schema(
  {
    roadWorthinessScore: {
      type: String,
    },
    overallTrafficScore: {
      type: String,
    },
    actionRequired: {
      type: String,
    },
    documents: [
      {
        textDoc: [
          {
            label: {
              type: String,
              ref: 'Document', // Reference from Document model
            },
            description: {
              type: String,
            },
          },
        ],
        attachments: [
          {
            type: Schema.Types.ObjectId,
          },
        ],
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

// Create the OcrsPlan model
const OcrsPlan = mongoose.model<IOcrsPlan>('OcrsPlan', OcrsPlanSchema);

// Export the OcrsPlan model
export default OcrsPlan;
