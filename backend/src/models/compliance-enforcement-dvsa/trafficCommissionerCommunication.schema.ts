import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a TrafficCommissionerCommunication document
export interface ITrafficCommissionerCommunication extends Document {
  type: string;
  contactedPerson: string;
  reason: string;
  communicationDate: Date;
  attachments?: mongoose.Types.ObjectId[];
  notes?: Date;
  createdBy: mongoose.Types.ObjectId;
}

// Define the TrafficCommissionerCommunication schema
const TrafficCommissionerCommunicationSchema: Schema<ITrafficCommissionerCommunication> =
  new Schema(
    {
      type: {
        type: String,
        required: true,
      } /* Type of communication */,
      contactedPerson: {
        type: String,
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      communicationDate: {
        type: Date,
        required: true,
      },
      attachments: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Document', // Reference from Document model
        },
      ],
      notes: {
        type: Date,
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference from User model
      },
    },
    { timestamps: true, versionKey: false }
  );

// Create the TrafficCommissionerCommunication model
const TrafficCommissionerCommunication = mongoose.model<ITrafficCommissionerCommunication>(
  'TrafficCommissionerCommunication',
  TrafficCommissionerCommunicationSchema
);

// Export the TrafficCommissionerCommunication model
export default TrafficCommissionerCommunication;
