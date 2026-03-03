import mongoose, { Document, Schema } from 'mongoose';

export enum AttendanceType {
  EMAIL = 'Email',
  PHONE_CALL = 'Phone Call',
  PHYSICAL_VISIT = 'Physical Visit',
  OTHER = 'Other',
}

// Define and export an interface representing a meeting-note document
export interface IMeetingNote extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  meetingDate: Date;
  attendance?: AttendanceType;
  keyDiscussionPoints?: string;
  discussion?: string;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the meeting-note schema
const MeetingNoteSchema: Schema<IMeetingNote> = new Schema(
  {
    // Define schema fields here
    // Example fields (replace with actual schema)
    meetingDate: {
      type: Date,
      required: true,
    },
    attendance: {
      type: String,
      enum: Object.values(AttendanceType),
    },
    keyDiscussionPoints: {
      type: String,
    },
    discussion: {
      type: String,
    },
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create the meeting-note model
const MeetingNote = mongoose.model<IMeetingNote>('MeetingNote', MeetingNoteSchema);

// Export the meeting-note model
export default MeetingNote;

