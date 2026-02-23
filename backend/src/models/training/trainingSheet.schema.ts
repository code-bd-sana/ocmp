import mongoose, { Document, Schema } from 'mongoose';

/** Interface representing a TrainingSheet document */
export interface ITrainingSheet extends Document {
  trainingName: string;
  intervalDays: number[];
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the TrainingSheet schema
const TrainingSheetSchema: Schema<ITrainingSheet> = new Schema(
  {
    trainingName: {
      type: String,
      required: true,
      trim: true,
    } /* Name of the training */,
    intervalDays: {
      type: [Number],
      required: true,
      default: [],
    } /* Array of interval days (e.g. [30, 60, 90]) */,
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    } /* Which Standalone or client this training belongs to */,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } /* User who created this training (TM or Standalone) */,
  },
  { timestamps: true, versionKey: false }
);

// Indexes for efficient lookup
TrainingSheetSchema.index({ createdBy: 1 });
TrainingSheetSchema.index({ standAloneId: 1 });

// Create the TrainingSheet model
const TrainingSheet = mongoose.model<ITrainingSheet>('TrainingSheet', TrainingSheetSchema);

// Export the TrainingSheet model
export default TrainingSheet;
