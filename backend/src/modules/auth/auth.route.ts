// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  changePassword,
  forgetPassword,
  login,
  logout,
  register,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from './auth.controller';

//Import validation from corresponding module
import isAuthorized from '../../middlewares/is-authorized';
import { requestMeta } from '../../middlewares/request-meta';
import {
  changePasswordAuth,
  forgetPasswordAuth,
  resendVerificationEmailAuth,
  resetPasswordAuth,
  validateLoginAuth,
  validateRegisterAuth,
  verifyEmailTokenAuth,
} from './auth.validation';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/auth/login
 * @description Login user and return JWT token
 * @access Public
 * @param {function} validation - ['validateLoginAuth']
 * @param {middleware} requestMeta - ['requestMeta']
 * @param {function} controller - ['login']
 */
router.post('/login', validateLoginAuth, requestMeta, login);

/**
 * @route POST /api/v1/auth/logout
 * @description Logout user and invalidate JWT token
 * @access Private
 * @param {middleware} isAuthorized - ['isAuthorized']
 * @param {function} controller - ['logout']
 */
router.post('/logout', isAuthorized, logout);

/**
 * @route POST /api/v1/auth/register
 * @description Register a new user
 * @access Public
 * @param {function} validation - ['validateRegisterAuth']
 * @param {function} controller - ['register']
 */
router.post('/register', validateRegisterAuth, register);

/**
 * @route PUT /api/v1/auth/verify-email
 * @description Verify user email using email verification token
 * @access Public
 * @param {function} validation - ['verifyEmailTokenAuth']
 * @param {function} controller - ['verifyEmail']
 */
router.put('/verify-email', verifyEmailTokenAuth, verifyEmail);

/**
 * @route POST /api/v1/auth/resend-verification-email
 * @description Resend email verification token to user's email
 * @access Public
 * @param {function} validation - ['resendVerificationEmailAuth']
 * @param {function} controller - ['resendVerificationEmail']
 */
router.post('/resend-verification-email', resendVerificationEmailAuth, resendVerificationEmail);

/**
 * @route POST /api/v1/auth/forget-password
 * @description Send password reset link to user's email
 * @access Public
 * @param {function} validation - ['forgetPasswordAuth']
 * @param {function} controller - ['forgetPassword']
 */
router.post('/forget-password', forgetPasswordAuth, forgetPassword);

/**
 * @route POST /api/v1/auth/reset-password
 * @description Reset user password using reset password token and user mail
 * @access Public
 * @param {function} validation - ['resetPasswordAuth']
 * @param {function} controller - ['resetPassword']
 */
router.post('/reset-password', resetPasswordAuth, resetPassword);

/**
 * @route PUT /api/v1/auth/change-password
 * @description Change user password
 * @access Private
 * @param {middleware} isAuthorized - ['isAuthorized']
 * @param {function} validation - ['changePasswordAuth']
 * @param {function} controller - ['changePassword']
 */
router.put('/change-password', isAuthorized, changePasswordAuth, changePassword);

// Export the router
module.exports = router;
