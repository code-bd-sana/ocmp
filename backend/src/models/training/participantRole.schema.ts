import mongoose, { Document, Schema } from 'mongoose';

/** Interface representing a ParticipantRole document */
export interface IParticipantRole extends Document {
  roleName: string;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the ParticipantRole schema
const ParticipantRoleSchema: Schema<IParticipantRole> = new Schema(
  {
    roleName: {
      type: String,
      required: true,
      trim: true,
    } /* Name of the role (e.g. "Driver", "Mechanic") */,
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    } /* Which Standalone or client this role belongs to */,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } /* User who created this role (TM or Standalone) */,
  },
  { timestamps: true, versionKey: false }
);

// Index for efficient lookup by creator
ParticipantRoleSchema.index({ createdBy: 1 });
ParticipantRoleSchema.index({ standAloneId: 1 });

// Case-insensitive unique index: same standalone user cannot have duplicate role names
// For TM: unique per (roleName, standAloneId, createdBy)
ParticipantRoleSchema.index(
  { roleName: 1, standAloneId: 1, createdBy: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

// Create the ParticipantRole model
const ParticipantRole = mongoose.model<IParticipantRole>('ParticipantRole', ParticipantRoleSchema);

// Export the ParticipantRole model
export default ParticipantRole;
