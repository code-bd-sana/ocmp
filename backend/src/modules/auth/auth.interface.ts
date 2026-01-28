/**
 * Type definition for Login.
 *
 * This type defines the structure of a single auth object.
 * @interface ILogin
 */
export interface ILogin {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
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
 * This type defines the structure of a single register object.
 * @interface IRegister
 */
export interface IRegister {
  _id: string;
  fullName: string;
  email: string;
  role: 'TRANSPORT_MANAGER' | 'STANDALONE_USER';
}

/** Type definition for Resend Verification Email.
 *
 * This type defines the structure of a resend verification email object.
 * @interface IResendVerificationEmail
 */
export interface IResendVerificationEmail {
  email: string;
}

/**
 * Type definition for Verify Email.
 *
 * This type defines the structure of a verify email object.
 * @interface IVerifyEmail
 */
export interface IVerifyEmail {
  email: string;
  token: string;
}

/**
 * Type definition for Forget Password.
 *
 * This type defines the structure of a forget password object.
 * @interface IForgetPassword
 */
export interface IForgetPassword extends IResendVerificationEmail {}

/**
 * Type definition for Reset Password.
 *
 * This type defines the structure of a reset password object.
 * @interface IResetPassword
 */
export interface IResetPassword {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
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
