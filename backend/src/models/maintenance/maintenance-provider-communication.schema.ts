import mongoose, { Document, Schema } from 'mongoose';

export enum CommunicationType {
  EMAIL = 'Email',
  PHONE_CALL = 'Phone Call',
  PHYSICAL_VISIT = 'Physical Visit',
  OTHER = 'Other',
}

// Define and export an interface representing a maintenance-provider-communication document
export interface IMaintenanceProviderCommunication extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  providerName: string;
  dateOfCommunication: Date;
  type?: CommunicationType;
  details?: string;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the maintenance-provider-communication schema
const MaintenanceProviderCommunicationSchema: Schema<IMaintenanceProviderCommunication> =
  new Schema(
    {
      // Define schema fields here
      // Example fields (replace with actual schema)
      providerName: {
        type: String,
        required: true,
        trim: true,
      },
      dateOfCommunication: {
        type: Date,
        required: true,
      },
      type: {
        type: String,
        enum: Object.values(CommunicationType),
      },
      details: {
        type: String,
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
    {
      timestamps: true,
      versionKey: false,
    }
  );

// Create the maintenance-provider-communication model
const MaintenanceProviderCommunication = mongoose.model<IMaintenanceProviderCommunication>(
  'MaintenanceProviderCommunication',
  MaintenanceProviderCommunicationSchema
);

// Export the maintenance-provider-communication model
export default MaintenanceProviderCommunication;

