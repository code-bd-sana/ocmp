import mongoose, { Document, Schema } from 'mongoose';

// status can be In Progress, Completed, Pending Enum
export enum ToolBoxType {
  TRAINING = 'Training',
  TOOLBOX_TALK = 'Toolbox Talk',
}

// Define and export an interface representing a DriverTachograph document
export interface ITrainingToolBox extends Document {
  date: Date;
  driverId: mongoose.Types.ObjectId;
  toolboxTitle: string;
  typeOfToolbox: ToolBoxType;
  deliveredBy: mongoose.Types.ObjectId;
  notes?: string;
  signed?: boolean;
  followUpNeeded?: boolean;
  followUpDate?: Date;
  signOff?: boolean;
  attachments?: mongoose.Types.ObjectId[];
}

// Define the TrainingToolBox schema
const TrainingToolBoxSchema: Schema<ITrainingToolBox> = new Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Driver', // Reference from Driver model
    },
    toolboxTitle: {
      type: String,
      required: true,
    },
    typeOfToolbox: {
      type: String,
      enum: Object.values(ToolBoxType),
      required: true,
      default: ToolBoxType.TRAINING,
    },
    deliveredBy: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'User', // Reference from User model
    },
    notes: {
      type: String,
    },
    signed: {
      type: Boolean,
      default: false,
    },
    followUpNeeded: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    signOff: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document', // Reference from Document model
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

// Create the TrainingToolBox model
const TrainingToolBox = mongoose.model<ITrainingToolBox>('TrainingToolBox', TrainingToolBoxSchema);

// Export the TrainingToolBox model
export default TrainingToolBox;
