import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a Vehicle document
export interface IVehicle extends Document {
  vehicleRegId: string;
  vehicleType: string;
  licensePlate: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  additionalDetails: {
    lastServiceDate?: Date;
    nextServiceDate?: Date;
    grossPlatedWeight: number;
    ownerShipStatus:
      | 'Individual_Ownership'
      | 'Joint_Ownership'
      | 'Company/Business_Ownership'
      | 'Leased/Financed'
      | 'Fleet_Management';
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
  driverId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
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
      enum: ['PENDING', 'ACTIVE', 'INACTIVE'],
      required: true,
      default: 'PENDING',
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
        enum: [
          'Individual_Ownership',
          'Joint_Ownership',
          'Company/Business_Ownership',
          'Leased/Financed',
          'Fleet_Management',
        ],
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
    driverId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Which Standalone or client own this card
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

// employedBy
