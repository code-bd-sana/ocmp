import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a DriverTachograph document
export interface IDriverTachograph extends Document {
  driverId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  typeOfInfringement?: string;
  details?: string;
  actionTaken?: string;
  reviewedBy: mongoose.Types.ObjectId;
  Signed?: boolean;
}

// Define the DriverTachograph schema
const DriverTachographSchema: Schema<IDriverTachograph> = new Schema(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Driver', // Reference from Driver model
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle', // Reference from Vehicle model
    },
    typeOfInfringement: {
      type: String,
    },
    details: {
      type: String,
    },
    actionTaken: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'User', // Reference from User model
    },
    Signed: {
      type: Boolean,
      default: false,
    },
    
  },
  { timestamps: true, versionKey: false }
);

// Create the DriverTachograph model
const DriverTachograph = mongoose.model<IDriverTachograph>(
  'DriverTachograph',
  DriverTachographSchema
);

// Export the DriverTachograph model
export default DriverTachograph;
