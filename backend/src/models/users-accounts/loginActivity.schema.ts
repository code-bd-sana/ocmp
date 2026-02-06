import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a LoginActivity document
export interface ILoginActivity extends Document {
  email: string;
  loginHash?: string;
  ipAddress?: string;
  deviceInfo?: string;
  browser?: string;
  os?: string;
  location?: string;
  loginAt?: Date;
  logoutAt?: Date;
  isSuccessful?: boolean;
}

// Define the LoginActivity schema
const LoginActivitySchema: Schema<ILoginActivity> = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    loginHash: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    deviceInfo: {
      type: String,
    },
    browser: {
      type: String,
    },
    os: {
      type: String,
    },
    location: {
      type: String,
    },
    loginAt: {
      type: Date,
    },
    logoutAt: {
      type: Date,
    },
    isSuccessful: {
      type: Boolean,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the LoginActivity model
const LoginActivity = mongoose.model<ILoginActivity>('LoginActivity', LoginActivitySchema);

// Export the LoginActivity model
export default LoginActivity;
