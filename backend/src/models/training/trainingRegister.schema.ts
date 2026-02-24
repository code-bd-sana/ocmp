import mongoose, { Document, Schema } from 'mongoose';

/** Interface representing a TrainingRegister document */
export interface ITrainingRegister extends Document {
  participantId: mongoose.Types.ObjectId;
  trainingId: mongoose.Types.ObjectId;
  trainingInterval: number;
  trainingDate: Date;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the TrainingRegister schema
const TrainingRegisterSchema: Schema<ITrainingRegister> = new Schema(
  {
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
    } /* Reference to the Participant */,
    trainingId: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingSheet',
      required: true,
    } /* Reference to the TrainingSheet */,
    trainingInterval: {
      type: Number,
      required: true,
    } /* The specific interval day from the training's intervalDays array */,
    trainingDate: {
      type: Date,
      required: true,
    } /* The date when training was/will be conducted */,
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    } /* Which Standalone or client this register entry belongs to */,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } /* User who created this register entry (TM or Standalone) */,
  },
  { timestamps: true, versionKey: false }
);

// Indexes for efficient lookup
TrainingRegisterSchema.index({ createdBy: 1 });
TrainingRegisterSchema.index({ standAloneId: 1 });
TrainingRegisterSchema.index({ participantId: 1, trainingId: 1 });

// Create the TrainingRegister model
const TrainingRegister = mongoose.model<ITrainingRegister>('TrainingRegister', TrainingRegisterSchema);

// Export the TrainingRegister model
export default TrainingRegister;
