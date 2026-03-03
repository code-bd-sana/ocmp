import mongoose, { Document, Schema } from 'mongoose';

/**
 * Working Time Directive — Mongoose Schema & Model.
 *
 * Tracks working-time-directive compliance per driver/vehicle pair.
 * Supports both Transport Manager and Standalone User roles.
 *
 * Extra validation requirement: the vehicle must be assigned to the
 * driver (i.e. the vehicle's `driverIds` array must contain `driverId`).
 * This check is enforced at the service / controller layer.
 */

// ─── Interface ──────────────────────────────────────────────────────

export interface IWorkingTimeDirective extends Document {
  driverId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  workingHours: number;
  restHours?: number;
  complianceStatus?: string;
  tachoReportAvailable?: boolean;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// ─── Schema ─────────────────────────────────────────────────────────

const WorkingTimeDirectiveSchema: Schema<IWorkingTimeDirective> = new Schema(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Driver',
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle',
    },
    workingHours: {
      type: Number,
      required: true,
    },
    restHours: {
      type: Number,
    },
    complianceStatus: {
      type: String,
    },
    tachoReportAvailable: {
      type: Boolean,
    },
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true, versionKey: false }
);

// ─── Indexes ────────────────────────────────────────────────────────

WorkingTimeDirectiveSchema.index({ createdBy: 1 });
WorkingTimeDirectiveSchema.index({ standAloneId: 1 });
WorkingTimeDirectiveSchema.index({ driverId: 1 });
WorkingTimeDirectiveSchema.index({ vehicleId: 1 });

// ─── Model ──────────────────────────────────────────────────────────

const WorkingTimeDirective = mongoose.model<IWorkingTimeDirective>(
  'WorkingTimeDirective',
  WorkingTimeDirectiveSchema
);

export default WorkingTimeDirective;
