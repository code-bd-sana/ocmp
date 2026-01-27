import { v4 } from 'uuid';
import kcAdmin from '../../config/keycloak';
import User, { IUser } from '../../models/users-accounts/user.schema';
import HashInfo from '../../utils/bcrypt/hash-info';
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

/**
 * Service function to login.
 *
 * @param {ILogin} data - The data to login.
 * @returns {Promise<ILoginResponse>} - The login result.
 */
const login = async (data: ILogin): Promise<ILoginResponse> => {
  // Implementation for login service
  console.log(data, 'kire data ');
  const isExist = await User.findOne({ email: data.email });

  console.log(isExist, 'kire kahma');

  const login = await { access_token: '' };
  const userId = v4();
  if (!login.access_token) {
    const isExist = await User.findOne({ email: data.email });
    if (!isExist) {
      throw new Error('Invalid credentials');
    }

    const accessToken = await EncodeToken(isExist.email, isExist._id.toString());
    console.log(accessToken, 'this is access token from db');
    setUserToken(userId, accessToken, 3600); // Set token with 1 hour TTL
  }

  setUserToken(userId, login.access_token, 3600); // Set token with 1 hour TTL

  const simpleLogin = { token: userId, expiresIn: 3600 };
  return simpleLogin;
};

/**
 * Service function to register.
 *
 * @param {IRegister} data - The data to register.
 * @returns {Promise<IUser>} - The register result.
 */
const register = async (data: IUser): Promise<IUser> => {
  console.log(data, 'user kaka data');

  const existingUsers = await kcAdmin.users.find({
    realm: 'ocmp',
    email: data.email,
  });

  if (existingUsers.length > 0) {
    throw new Error('User already exists with this email');
  }

  const user = await kcAdmin.users.create({
    realm: 'ocmp',
    username: data.email, // ✅
    email: data.email,
    firstName: data.fullName, // ✅
    enabled: true,
    emailVerified: true,
    credentials: [
      {
        type: 'password',
        value: data.password,
        temporary: false,
      },
    ],
  });

  console.log(user);

  const role = await kcAdmin.roles.findOneByName({
    realm: 'ocmp',
    name: data.role,
  });

  if (!role) {
    throw new Error(`Role "${data.role}" not found`);
  }

  await kcAdmin.users.addRealmRoleMappings({
    realm: 'ocmp',
    id: user.id!,
    roles: [
      {
        id: role.id!,
        name: role.name!,
      },
    ],
  });

  const isExist = await User.findOne({ email: data.email });
  if (isExist) {
    throw new Error('User already exists with this email');
  }

  const hashPassword = await HashInfo(data.password);

  const savedUser = await User.create({
    keyCloakId: user.id ?? '',
    fullName: data.fullName,
    email: data.email,
    password: hashPassword,
    role: data.role,
  });

  return {
    fullName: savedUser.fullName,
    email: savedUser.email,
    role: savedUser.role,
    _id: savedUser._id,
  } as IUser;

  // Implementation for register service
};

/**
 * Service function to verify email.
 *
 * @param {IVerifyEmail} data - The data to verify email.
 * @returns {Promise<void>} - The verify email result.
 */
const verifyEmail = async (data: IVerifyEmail): Promise<void> => {
  // Implementation for verify email service
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
  forgetPassword,
  resetPassword,
  changePassword,
};
