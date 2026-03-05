import mongoose, { Schema } from 'mongoose';

export enum NotificationType {
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
  PLANNER_UPDATE_REQUEST = 'PLANNER_UPDATE_REQUEST',
  PLANNER_UPDATE_APPROVAL = 'PLANNER_UPDATE_APPROVAL',
  PLANNER_UPDATE_REJECTION = 'PLANNER_UPDATE_REJECTION',
}

export interface INotification extends Document {
  receiver: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  referenceModel?: string;
  referenceId?: mongoose.Types.ObjectId;
  isRead: boolean;
}

// Define the Notification schema
export const Notification: Schema<INotification> = new Schema({
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true,
  },
  referenceModel: {
    type: String,
    default: null,
  },
  referenceId: {
    type: mongoose.Types.ObjectId,
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

const NotificationSchema = mongoose.model<INotification>('Notification', Notification);
export default NotificationSchema;
