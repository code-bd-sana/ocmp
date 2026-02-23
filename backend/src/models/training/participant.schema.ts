import mongoose, { Document, Schema } from 'mongoose';

/** Interface representing a Participant document */
export interface IParticipant extends Document {
  firstName: string;
  lastName: string;
  role: mongoose.Types.ObjectId;
  employmentStatus: boolean;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the Participant schema
const ParticipantSchema: Schema<IParticipant> = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    } /* First name of the participant */,
    lastName: {
      type: String,
      required: true,
      trim: true,
    } /* Last name of the participant */,
    role: {
      type: Schema.Types.ObjectId,
      ref: 'ParticipantRole',
      required: true,
    } /* Reference to ParticipantRole */,
    employmentStatus: {
      type: Boolean,
      required: true,
      default: true,
    } /* Whether the participant is currently employed */,
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    } /* Which Standalone or client this participant belongs to */,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } /* User who created this participant (TM or Standalone) */,
  },
  { timestamps: true, versionKey: false }
);

// Index for efficient lookup by creator
ParticipantSchema.index({ createdBy: 1 });
ParticipantSchema.index({ standAloneId: 1 });

// Create the Participant model
const Participant = mongoose.model<IParticipant>('Participant', ParticipantSchema);

// Export the Participant model
export default Participant;
