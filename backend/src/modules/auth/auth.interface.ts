import { UserRole } from '../../models';

/**
 * Type definition for Login.
 *
 * This type defines the structure of a single auth object.
 * @interface ILogin
 */
export interface ILogin {
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Type definition for login response.
 *
 * This type defines the structure of a login response object.
 * @interface ILoginResponse
 */
export interface ILoginResponse {
  token: string;
}

/**
 * Type definition for Register.
 *
 * This type defines the structure of a register response object.
 * @interface IRegisterResponse
 */
export interface IRegisterResponse {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

/**
 * Type definition for Change Password.
 *
 * This type defines the structure of a change password object.
 * @interface IChangePassword
 */
export interface IChangePassword {
  userId: string; // User ID
  currentPassword: string;
  newPassword: string;
}
