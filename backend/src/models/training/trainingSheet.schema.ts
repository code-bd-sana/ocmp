import mongoose, { Document, Schema } from 'mongoose';

/** Interface representing a TrainingSheet document */
export interface ITrainingSheet extends Document {
  trainingName: string;
  intervalDays: number[];
  creatorId: mongoose.Types.ObjectId;
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
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } /* Transport Manager who created this training */,
  },
  { timestamps: true, versionKey: false }
);

// Compound index for efficient lookup by creator
TrainingSheetSchema.index({ creatorId: 1 });

// Create the TrainingSheet model
const TrainingSheet = mongoose.model<ITrainingSheet>('TrainingSheet', TrainingSheetSchema);

// Export the TrainingSheet model
export default TrainingSheet;
