import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a FuelUsage document
export interface IFuelUsage extends Document {
  vehicleId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  adBlueUsed?: Number;
  fuelUsed?: Number;
  createdBy: mongoose.Types.ObjectId;
}

// Define the FuelUsage schema
const FuelUsageSchema: Schema<IFuelUsage> = new Schema(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle', // Reference from Vehicle model
    },
    driverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Driver', // Reference from Driver model
    },
    adBlueUsed: {
      type: Number,
    } /* In Liter */,
    fuelUsed: {
      type: Number,
    } /* In Liter */,
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the FuelUsage model
const FuelUsage = mongoose.model<IFuelUsage>('FuelUsage', FuelUsageSchema);

// Export the FuelUsage model
export default FuelUsage;
