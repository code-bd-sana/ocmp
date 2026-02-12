import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a WheelRetorquePolicyMonitoring document
export interface IWheelRetorquePolicyMonitoring extends Document {
  vehicleId: mongoose.Types.ObjectId;
  dateChanged?: Date;
  tyreSize?: string;
  tyreLocation?: string;
  reTorqueDue?: Date;
  reTorqueCompleted?: Date;
  technician?: string;
  createdBy: mongoose.Types.ObjectId;
}

// Define the ComplianceTimeTable schema
const WheelRetorquePolicyMonitoringSchema: Schema<IWheelRetorquePolicyMonitoring> = new Schema(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle', // Reference from Vehicle model
    },
    dateChanged: {
      type: Date,
    },
    tyreSize: {
      type: String,
    },
    tyreLocation: {
      type: String,
    },
    reTorqueDue: {
      type: Date,
    },
    reTorqueCompleted: {
      type: Date,
    },
    technician: {
      type: String,
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
const WheelRetorquePolicyMonitoring = mongoose.model<IWheelRetorquePolicyMonitoring>(
  'WheelRetorquePolicyMonitoring',
  WheelRetorquePolicyMonitoringSchema
);

// Export the WheelRetorquePolicyMonitoring model
export default WheelRetorquePolicyMonitoring;
