import { v4 } from 'uuid';
import config from '../../config/config';
import kcAdmin from '../../config/keycloak';
import LoginActivity from '../../models/users-accounts/loginActivity.schema';
import User, { IUser } from '../../models/users-accounts/user.schema';
import compareInfo from '../../utils/bcrypt/compare-info';
import HashInfo from '../../utils/bcrypt/hash-info';
import SendEmail from '../../utils/email/send-email';
import EncodeToken from '../../utils/jwt/encode-token';
import { setUserToken } from '../../utils/redis/auth/auth';
import {
  IChangePassword,
  IForgetPassword,
  ILogin,
  ILoginResponse,
  IRegister,
  IResetPassword,
  IVerifyEmail,
} from './auth.interface';
import { loginUser } from './keycloak.service';

/**
 * Service function to login.
 *
 * @param {ILogin} data - The data to login.
 * @returns {Promise<ILoginResponse|void* >} - The login result.
 */
const login = async (data: ILogin): Promise<ILoginResponse | void> => {
  // Check the requested user from the keycloak is verified
  const user = await kcAdmin.users.find({
    realm: config.KEYCLOAK_REALM,
    username: data.email,
  });

  // Implementation for login service
  const loginData = await loginUser(data);

  // Generate a unique user ID for session management
  const userId = v4();

  // If Keycloak did not return an access token, validate against our DB
  if (!loginData?.access_token) {
    // Verify user exists in our database
    const isExist = await User.findOne({ email: data.email });

    // If user does not exist, throw an error
    if (!isExist) {
      throw new Error('Invalid credentials');
    }

    // Validate password from DB when Keycloak is unavailable
    const isValidPassword = await compareInfo(data.password, isExist.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Encode a new JWT token for the user
    const accessToken = await EncodeToken(isExist.email, isExist._id.toString());

    // Log the login activity
    await LoginActivity.create({
      email: data.email,
      ipAddress: data.ipAddress,
      deviceInfo: data.userAgent,
      loginAt: new Date(),
      isSuccessful: true,
    });

    // Set the user token in Redis with a TTL of 30 days
    await setUserToken(userId, accessToken, 30 * 24 * 60 * 60);

    return {
      token: userId, // Return the unique user ID as the token
    };
  }

  // Log the login activity
  await LoginActivity.create({
    email: data.email,
    ipAddress: data.ipAddress,
    deviceInfo: data.userAgent,
    loginAt: new Date(),
    isSuccessful: true,
  });

  // Set the user token in Redis with a TTL of 30 days
  await setUserToken(userId, loginData.access_token, 30 * 24 * 60 * 60);

  // Return the unique user ID as the token
  return {
    token: userId,
  };
};

/**
 * Service function to register.
 *
 * @param {IRegister} data - The data to register.
 * @returns {Promise<IUser>} - The register result.
 */
const register = async (data: IUser): Promise<IUser> => {
  // Check if user already exists in Keycloak
  const existingUsers = await kcAdmin.users.find({
    realm: config.KEYCLOAK_REALM,
    email: data.email,
  });

  // If user exists, throw an error
  if (existingUsers.length > 0) {
    throw new Error('User already exists with this email');
  }

  // Create user in Keycloak
  const user = await kcAdmin.users.create({
    realm: config.KEYCLOAK_REALM,
    username: data.email,
    email: data.email,
    firstName: data.fullName,
    enabled: true,
    emailVerified: false, // Will verify via email
    credentials: [
      {
        type: 'password',
        value: data.password,
        temporary: false,
      },
    ],
  });

  // Assign role
  const role = await kcAdmin.roles.findOneByName({
    realm: config.KEYCLOAK_REALM,
    name: data.role,
  });

  if (!role) throw new Error(`Role "${data.role}" not found`);

  await kcAdmin.users.addRealmRoleMappings({
    realm: config.KEYCLOAK_REALM,
    id: user.id!,
    roles: [{ id: role.id!, name: role.name! }],
  });

  const emailVerificationToken = v4();
  const emailVerificationExpiry = new Date();
  emailVerificationExpiry.setHours(emailVerificationExpiry.getHours() + 12); // 12 hours expiry

  // Send verification email with custom link
  const verificationLink = `${config.EMAIL_VERIFICATION_REDIRECT_URI}?email=${encodeURIComponent(data.email)}&token=${emailVerificationToken}`;

  await SendEmail({
    to: data.email,
    subject: 'Verify your email',
    text: `Please verify your email by clicking the link: ${verificationLink}`,
    html: `<p>Please verify your email by clicking the link: <a href="${verificationLink}">Verify Email</a></p>`,
  });

  // Save in remote database
  const hashPassword = await HashInfo(data.password);

  const savedUser = await User.create({
    keyCloakId: user.id,
    fullName: data.fullName,
    email: data.email,
    password: hashPassword,
    role: data.role,
    isEmailVerified: false,
    isActive: true,
    emailVerificationToken,
    emailVerificationTokenExpiry: emailVerificationExpiry,
  });

  return {
    fullName: savedUser.fullName,
    email: savedUser.email,
    phone: savedUser.phone,
    role: savedUser.role,
  } as IUser;
};

/**
 * Resend verification email service function.
 *
 * @param {string} email - The email to resend verification.
 * @returns {Promise<void>} - The resend verification email result.
 */
const resendVerificationEmail = async (email: string): Promise<void> => {
  // Check if user already exists in Keycloak
  return;
};

/**
 * Service function to verify email.
 *
 * @param {IVerifyEmail} data - The data to verify email.
 * @returns {Promise<void>} - The verify email result.
 */
const verifyEmail = async (data: IVerifyEmail): Promise<void> => {
  // Update user email verification status in Keycloak
  const existingUsers = await kcAdmin.users.find({
    realm: config.KEYCLOAK_REALM,
    email: data.email,
  });

  // If user does not exist, throw an error
  if (existingUsers.length === 0) {
    throw new Error('User not found with this email');
  }

  // Update emailVerified to true in Keycloak
  await kcAdmin.users.update(
    {
      realm: config.KEYCLOAK_REALM,
      id: existingUsers[0].id!,
    },
    {
      emailVerified: true,
    }
  );

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
 * @param {IForgetPassword} data - The data to forget password.
 * @returns {Promise<void>} - The forget password result.
 */
const forgetPassword = async (data: IForgetPassword): Promise<void> => {
  // Implementation for forget password service
};

/**
 *  Service function to reset password.
 *
 * @param {IResetPassword} data - The data to reset password.
 * @returns {Promise<void>} - The reset password result.
 */
const resetPassword = async (data: IResetPassword): Promise<void> => {
  // Implementation for reset password service
};

/**
 * Service function to change password.
 *
 * @param {IChangePassword} data - The data to change password.
 * @returns {Promise<void>} - The change password result.
 */
const changePassword = async (data: IChangePassword): Promise<void> => {
  // Implementation for change password service
};

export const authServices = {
  login,
  register,
  verifyEmail,
  resendVerificationEmail,
  forgetPassword,
  resetPassword,
  changePassword,
};
