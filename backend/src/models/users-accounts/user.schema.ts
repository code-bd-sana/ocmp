import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a User document
export interface IUser extends Document {
  avatar?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  role: 'SUPER_ADMIN' | 'TRANSPORT_MANAGER' | 'STANDALONE_USER' | 'STAFF';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  isActive: boolean;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema(
  {
    /* Stores user account information (login, role). */
    avatar: {
      type: Schema.Types.ObjectId,
      ref: 'Document', // Reference to the Document model
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'TRANSPORT_MANAGER', 'STANDALONE_USER', 'STAFF'],
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    } /* Email verification status */,
    emailVerificationToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    } /* Account enabled/disabled */,
  },
  { timestamps: true, versionKey: false }
);

// Create the User model
const User = mongoose.model<IUser>('User', UserSchema);

// Export the User model
export default User;
