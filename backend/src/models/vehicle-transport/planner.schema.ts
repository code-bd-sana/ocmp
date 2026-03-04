import mongoose, { Schema } from 'mongoose';

export enum PlannerType {
  INSPECTIONS = 'INSPECTIONS',
  MOT = 'MOT',
  BRAKE_TEST = 'BRAKE_TEST',
  SERVICE = 'SERVICE',
  REPAIR = 'REPAIR',
  TACHO_CAL = 'TACHO_RECALIBRATION',
  VED = 'VED',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface IPlanner extends Document {
  vehicleId: mongoose.Types.ObjectId;
  plannerType: PlannerType;
  plannerDate: Date;
  requestedDate?: Date;
  requestedReason?: string;
  requestStatus?: RequestStatus;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the Planner schema
const PlannerSchema: Schema<IPlanner> = new Schema({
  vehicleId: {
    type: mongoose.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  plannerType: {
    type: String,
    enum: Object.values(PlannerType),
    required: true,
  },
  plannerDate: {
    type: Date,
    required: true,
  },
  requestedDate: {
    type: Date,
  },
  requestedReason: {
    type: String,
  },
  requestStatus: {
    type: String,
    enum: Object.values(RequestStatus),
  },
  standAloneId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Planner = mongoose.model<IPlanner>('Planner', PlannerSchema);

export default Planner;
