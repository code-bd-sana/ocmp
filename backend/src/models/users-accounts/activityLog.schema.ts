import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a ActivityLog document
export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  description?: string;
}

// Define the ActivityLog schema
const ActivityLogSchema: Schema<IActivityLog> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
    },
    entityType: {
      type: String,
    },
    entityId: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the ActivityLog model
const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

// Export the ActivityLog model
export default ActivityLog;
