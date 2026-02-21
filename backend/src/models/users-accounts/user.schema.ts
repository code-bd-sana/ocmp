import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TRANSPORT_MANAGER = 'TRANSPORT_MANAGER',
  STANDALONE_USER = 'STANDALONE_USER',
  STAFF = 'STAFF',
  OTHERS = 'OTHERS',
}

// Define and export an interface representing a User document
export interface IUser extends Document {
  avatar?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  role: UserRole;
  clientName?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  isActive: boolean;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema(
  {
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
      unique: true,
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
    } /* Password reset token */,
    resetTokenExpiry: {
      type: Date,
    } /* Password reset token expiry */,
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    clientName: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    } /* Email verification status */,
    emailVerificationToken: {
      type: String,
    } /* Email verification token */,
    emailVerificationTokenExpiry: {
      type: Date,
    } /* Email verification token expiry */,
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
