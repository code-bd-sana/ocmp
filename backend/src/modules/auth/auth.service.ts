import { Request } from 'express';
import mongoose from 'mongoose';
import { v4 } from 'uuid';
import config from '../../config/config';
import LoginActivity from '../../models/users-accounts/loginActivity.schema';
import User, { IUser, UserRole } from '../../models/users-accounts/user.schema';
import compareInfo from '../../utils/bcrypt/compare-info';
import HashInfo from '../../utils/bcrypt/hash-info';
import SendEmail from '../../utils/email/send-email';
import EncodeToken from '../../utils/jwt/encode-token';
import { delUserToken, existsUserToken, setUserToken } from '../../utils/redis/auth/auth';
import { delUserData, getUserData, setUserData } from '../../utils/redis/user/user';
import { IChangePassword, ILogin, ILoginResponse, IRegisterResponse } from './auth.interface';
import {
  ForgotPasswordInput,
  RegisterInput,
  ResendVerificationEmailInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './auth.validation';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        loginHash: string;
      };
    }
  }
}

/**
 * Service function to login.
 *
 * @param {ILogin} data - The data to login.
 * @returns {Promise<ILoginResponse|void* >} - The login result.
 */
const login = async (data: ILogin): Promise<ILoginResponse | void> => {
  // Find user by email
  const user = await User.findOne({ email: data.email });

  // If user not found
  if (!user) {
    throw new Error('User not found');
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new Error('Email not verified');
  }

  // Match user password
  const isPasswordValid = await compareInfo(data.password, user.password);

  // If password is invalid
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  // generate unique user ID and login hash
  const userId = v4();
  const loginHash = v4();

  const loginAt = new Date();

  // generate access token
  const accessToken = await EncodeToken(user._id.toString(), user.email, user.role, loginHash);

  // Save login activity
  await LoginActivity.create({
    email: data.email,
    loginHash,
    ipAddress: data.ipAddress,
    deviceInfo: data.userAgent,
    loginAt,
    isSuccessful: true,
  });

  // Set the user token in Redis with a TTL of 30 days
  await setUserToken(userId, accessToken, 30 * 24 * 60 * 60);

  // Set user data in Redis if not already present
  if (!(await getUserData<IUser>(user._id.toString())) !== null) {
    // Update the user data in Redis cache
    await setUserData(
      user._id.toString(),
      {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      30 * 24 * 60 * 60
    ); // Set TTL to 30 days
  }

  // Return the unique user ID as the token
  return {
    token: userId,
  };
};

/**
 * Service function to logout.
 *
 * @param {Request} req - The request object.
 * @returns {Promise<void>} - The logout result.
 */
const logout = async (req: Request): Promise<void> => {
  // Retrieve the Authorization header from the request or token from cookies
  const authHeader: string | undefined = req.headers['authorization'] || req.cookies?.token;

  // Extract the token from the Authorization header
  const userId = authHeader?.split(' ')[1];

  if (userId) {
    // Invalidate the token in Redis by deleting it
    const tokenExists = await existsUserToken(userId);

    if (tokenExists) {
      // Delete login activity
      await LoginActivity.deleteOne({
        email: req.user?.email,
        loginHash: req.user?.loginHash,
      });

      // Delete the user token from Redis
      await delUserToken(userId);

      // Optionally, you can also clear user data from Redis cache
      await delUserData(req.user?._id.toString() as string);
    }
  }
};

/**
 * Service function to register.
 *
 * @param {RegisterInput} data - The data to register.
 * @returns {Promise<IUser>} - The register result.
 */
const register = async (data: RegisterInput): Promise<IRegisterResponse> => {
  // Check if user already exists in Database
  const existingUser = await User.findOne({ email: data.email });

  // If user exists, throw an error
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash password for MongoDB (even if Keycloak also stores it)
  const hashedPassword = await HashInfo(data.password);

  // Generate email verification token
  const emailVerificationToken = v4();
  const emailVerificationExpiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours

  // 5. Save user in MongoDB – link to Keycloak ID
  const savedUser = await User.create({
    fullName: data.fullName,
    email: data.email,
    password: hashedPassword,
    role: data.role as UserRole,
    isEmailVerified: false,
    isActive: true,
    emailVerificationToken,
    emailVerificationTokenExpiry: emailVerificationExpiry,
  });

  // Send verification email
  const verificationLink = `${config.EMAIL_VERIFICATION_REDIRECT_URI}?email=${encodeURIComponent(
    data.email
  )}&token=${emailVerificationToken}`;

  await SendEmail({
    to: data.email,
    subject: 'Verify your email address',
    text: `Click the link to verify your email: ${verificationLink}`,
    html: `
      <p>Hello ${data.fullName || 'there'},</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link expires in 12 hours.</p>
    `,
  });

  // Return safe subset of user data
  return {
    _id: savedUser._id.toString(),
    fullName: savedUser.fullName,
    email: savedUser.email,
    role: savedUser.role,
  };
};

/**
 * Resend verification email service function.
 *
 * @param {ResendVerificationEmailInput} data - The data to resend verification.
 * @returns {Promise<void>} - The resend verification email result.
 */
const resendVerificationEmail = async (data: ResendVerificationEmailInput): Promise<void> => {
  // Check if user already exists in Database
  const user = await User.findOne({ email: data.email });

  // If user not found
  if (!user) {
    throw new Error('User not found');
  }

  // If email is already verified
  if (user.isEmailVerified) {
    throw new Error('Email is already verified');
  }

  // Generate new email verification token
  const emailVerificationToken = v4();
  const emailVerificationExpiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours

  // Update user with new token and expiry
  await User.updateOne(
    { email: data.email },
    {
      emailVerificationToken,
      emailVerificationTokenExpiry: emailVerificationExpiry,
    }
  );

  // Send verification email
  const verificationLink = `${config.EMAIL_VERIFICATION_REDIRECT_URI}?email=${encodeURIComponent(
    data.email
  )}&token=${emailVerificationToken}`;

  // Send verification email
  await SendEmail({
    to: data.email,
    subject: 'Verify your email address',
    text: `Click the link to verify your email: ${verificationLink}`,
    html: `
      <p>Hello ${user.fullName || 'there'},</p
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link expires in 12 hours.</p>
    `,
  });

  return;
};

/**
 * Service function to verify email.
 *
 * @param {VerifyEmailInput} data - The data to verify email.
 * @returns {Promise<void>} - The verify email result.
 */
const verifyEmail = async (data: VerifyEmailInput): Promise<void> => {
  // Update in remote database
  await User.updateOne(
    {
      email: data.email,
      emailVerificationToken: data.token,
      emailVerificationTokenExpiry: { $gt: new Date() },
    },
    { isEmailVerified: true, emailVerificationToken: null, emailVerificationTokenExpiry: null }
  );

  return;
};

/**
 * Service function to handle forget password.
 *
 * @param {ForgotPasswordInput} data - The data to forget password.
 * @returns {Promise<void>} - The forget password result.
 */
const forgetPassword = async (data: ForgotPasswordInput): Promise<void> => {
  // Check if user exists
  const user = await User.findOne({ email: data.email });

  // If user not found
  if (!user) {
    throw new Error('User not found');
  }

  // Generate reset password token
  const resetPasswordToken = v4();
  const resetPasswordExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  // Set the user's password reset token and expiry
  await User.updateOne(
    { email: data.email },
    { resetToken: resetPasswordToken, resetTokenExpiry: resetPasswordExpiry }
  );

  // Send reset password email
  const resetLink = `${config.PASSWORD_RESET_REDIRECT_URI}?email=${encodeURIComponent(
    data.email
  )}&token=${resetPasswordToken}`;

  await SendEmail({
    to: data.email,
    subject: 'Reset your password',
    text: `Click the link to reset your password: ${resetLink}`,
    html: `
      <p>Hello ${user.fullName || 'there'},</p>
      <p>You can reset your password by clicking the link below:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
  });

  return;
};

/**
 *  Service function to reset password.
 *
 * @param {ResetPasswordInput} data - The data to reset password.
 * @returns {Promise<void>} - The reset password result.
 */
const resetPassword = async (data: ResetPasswordInput): Promise<void> => {
  // Find user by email and reset token
  const user = await User.findOne({
    email: data.email,
  });

  // If user not found
  if (!user) {
    throw new Error('User not found');
  }

  // Check if reset token is valid and not expired
  if (
    user.resetToken !== data.token ||
    !user.resetTokenExpiry ||
    user.resetTokenExpiry < new Date()
  ) {
    throw new Error('Invalid or expired reset token');
  }

  // Old password should not be the same as new password
  const isSamePassword = await compareInfo(data.password, user.password);

  if (isSamePassword) {
    throw new Error('New password must be different from the old password');
  }

  // Hash the new password
  const hashedPassword = await HashInfo(data.password);

  // Update user's password and clear reset token fields
  await User.updateOne(
    { email: data.email },
    { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
  );

  return;
};

/**
 * Service function to change password.
 *
 * @param {IChangePassword} data - The data to change password.
 * @returns {Promise<void>} - The change password result.
 */
const changePassword = async (data: IChangePassword): Promise<void> => {
  const { userId, currentPassword, newPassword } = data;

  // Find user by ID
  const user = await User.findById(new mongoose.Types.ObjectId(userId));

  // If user not found
  if (!user) {
    throw new Error('User not found');
  }

  // Match old password
  const isOldPasswordValid = await compareInfo(currentPassword, user.password);

  // If old password is invalid
  if (!isOldPasswordValid) {
    throw new Error('Invalid old password');
  }

  // Old password should not be the same as new password
  const isSamePassword = await compareInfo(newPassword, user.password);

  if (isSamePassword) {
    throw new Error('New password must be different from the old password');
  }

  // Hash the new password
  const hashedNewPassword = await HashInfo(newPassword);

  // Update user's password
  await User.updateOne({ _id: user._id }, { password: hashedNewPassword });

  return;
};

export const authServices = {
  login,
  logout,
  register,
  verifyEmail,
  resendVerificationEmail,
  forgetPassword,
  resetPassword,
  changePassword,
};
