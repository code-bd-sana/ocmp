import { Request, Response } from 'express';
import ServerResponse from '../../helpers/responses/custom-response';
import LoginActivity from '../../models/users-accounts/loginActivity.schema';
import catchAsync from '../../utils/catch-async/catch-async';
import { authServices } from './auth.service';

/**
 * Controller function to handle the login.
 *
 * @param {Request} req - The request object containing login data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ILogin>>} - The login result.
 * @throws {Error} - Throws an error if the auth creation fails.
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create a new auth and get the result
  const result = await authServices.login(req.body);

  if (!result) {
    // Log the failed login activity
    await LoginActivity.create({
      email: req.body.email,
      ipAddress: req.body.ipAddress,
      deviceInfo: req.body.userAgent,
      loginAt: new Date(),
      isSuccessful: false,
    });
    throw new Error('Failed to login');
  }
  // Send a success response with the created auth data
  ServerResponse(res, true, 201, 'Login successful', result);
});

/**
 * Controller function to handle the logout.
 *
 * @param {Request} req - The request object containing logout data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the logout is successful.
 * @throws {Error} - Throws an error if the logout process fails.
 */
export const logout = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to logout
  await authServices.logout(req);
  // Send a success response indicating logout
  ServerResponse(res, true, 200, 'Logout successful');
});

/**
 * Controller function to handle the register.
 *
 * @param {Request} req - The request object containing register data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IRegister>>} - The register result.
 * @throws {Error} - Throws an error if the auth creation fails.
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create a new auth and get the result
  const savedUser = await authServices.register(req.body);
  // Send a success response with the created auth data
  ServerResponse(res, true, 201, 'Registration successful. Please verify your email.', savedUser);
});

/**
 * Controller function to handle the email verification.
 *
 * @param {Request} req - The request object containing verification data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the email is verified.
 * @throws {Error} - Throws an error if the email verification fails.
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to verify email
  await authServices.verifyEmail(req.body);
  // Send a success response indicating email verification
  ServerResponse(res, true, 200, 'Email verified successfully');
});

/** Controller function to handle resending the verification email.
 *
 * @param {Request} req - The request object containing email data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the verification email is resent.
 * @throws {Error} - Throws an error if the resend verification email process fails.
 */
export const resendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to resend verification email
  await authServices.resendVerificationEmail(req.body);
  // Send a success response indicating email verification
  ServerResponse(res, true, 200, 'Verification email resent successfully');
});

/**
 * Controller function to handle the forget password.
 *
 * @param {Request} req - The request object containing forget password data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the forget password process is initiated.
 * @throws {Error} - Throws an error if the forget password process fails.
 */
export const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to initiate forget password process
  await authServices.forgetPassword(req.body);
  // Send a success response indicating forget password initiation
  ServerResponse(res, true, 200, 'Password reset link sent successfully');
});

/**
 * Controller function to handle the reset password.
 *
 * @param {Request} req - The request object containing reset password data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the password is reset.
 * @throws {Error} - Throws an error if the password reset process fails.
 */
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to reset the password
  await authServices.resetPassword(req.body);
  // Send a success response indicating password reset
  ServerResponse(res, true, 200, 'Password reset successfully');
});

/**
 * Controller function to handle the change password.
 *
 * @param {Request} req - The request object containing change password data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the password is changed.
 * @throws {Error} - Throws an error if the password change process fails.
 */
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to change the password
  const userId = (req as any).user?.id as string;
  await authServices.changePassword({ userId, ...req.body });
  // Send a success response indicating password change
  ServerResponse(res, true, 200, 'Password changed successfully');
});
