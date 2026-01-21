import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a Notification document
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title?: string;
  message?: string;
  type?: 'SYSTEM' | 'BILLING' | 'SUBSCRIPTION' | 'SECURITY';
  isRead: boolean;
  readAt?: Date;
}

// Define the Notification schema
const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    type: {
      type: String,
      enum: ['SYSTEM', 'BILLING', 'SUBSCRIPTION', 'SECURITY'],
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the Notification model
const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

// Export the Notification model
export default Notification;
