import mongoose, { Document, Schema } from 'mongoose';

export enum VehicleStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum OwnerShipStatus {
  Individual_Ownership = 'Individual_Ownership',
  Joint_Ownership = 'Joint_Ownership',
  Company_Business_Ownership = 'Company/Business_Ownership',
  Leased_Financed = 'Leased/Financed',
  Fleet_Management = 'Fleet_Management',
}

// Define and export an interface representing a Vehicle document
export interface IVehicle extends Document {
  vehicleRegId: string;
  vehicleType: string;
  licensePlate: string;
  status: VehicleStatus;
  additionalDetails: {
    lastServiceDate?: Date;
    nextServiceDate?: Date;
    grossPlatedWeight: number;
    ownerShipStatus: OwnerShipStatus;
    diskNumber: Date;
    dateLeft?: Date;
    chassisNumber: string;
    keysAvailable: number;
    v5InName: boolean;
    plantingCertificate: boolean;
    vedExpiry?: Date;
    insuranceExpiry?: Date;
    serviceDueDate?: Date;
  };
  driverPack: boolean;
  notes?: string;
  driverIds: mongoose.Types.ObjectId[];
  standAloneId: mongoose.Types.ObjectId;
  attachments?: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
}

// Define the Vehicle schema
const VehicleSchema: Schema<IVehicle> = new Schema(
  {
    vehicleRegId: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      required: true,
      default: VehicleStatus.PENDING,
    },
    additionalDetails: {
      lastServiceDate: {
        type: Date,
      },
      nextServiceDate: {
        type: Date,
      },
      grossPlatedWeight: {
        type: Number,
        required: true,
      },
      ownerShipStatus: {
        type: String,
        enum: Object.values(OwnerShipStatus),
        required: true,
      },
      diskNumber: {
        type: Date,
        required: true,
      },
      dateLeft: {
        type: Date,
      },
      chassisNumber: {
        type: String,
        required: true,
      },
      keysAvailable: {
        type: Number,
        required: true,
      },
      v5InName: {
        type: Boolean,
        required: true,
      },
      plantingCertificate: {
        type: Boolean,
        required: true,
      },
      vedExpiry: {
        type: Date,
      },
      insuranceExpiry: {
        type: Date,
      },
      serviceDueDate: {
        type: Date,
      },
    },
    driverPack: {
      type: Boolean,
      required: true,
    },
    notes: {
      type: String,
    },
    driverIds: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Driver', // Reference to the Driver model
      },
    ],
    standAloneId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Which Standalone or client own this vehicle
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document', // Reference to the Document model
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the Vehicle model
const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);

// Export the Vehicle model
export default Vehicle;

// standAloneId
