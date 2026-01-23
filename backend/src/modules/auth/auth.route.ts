// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  changePassword,
  forgetPassword,
  login,
  register,
  resetPassword,
  verifyEmail,
} from './auth.controller';

//Import validation from corresponding module
import {
  changePasswordAuth,
  forgetPasswordAuth,
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
 * @param {function} controller - ['login']
 * @param {function} validation - ['validateLoginAuth']
 */
router.post('/login', validateLoginAuth, login);

/**
 * @route POST /api/v1/auth/register
 * @description Register a new user
 * @access Public
 * @param {function} controller - ['register']
 * @param {function} validation - ['validateRegisterAuth']
 */
router.post('/register', validateRegisterAuth, register);

/**
 * @route PATCH /api/v1/auth/verify-email
 * @description Verify user email using email verification token
 * @access Public
 * @param {function} controller - ['verifyEmail']
 * @param {function} validation - ['verifyEmailTokenAuth']
 */
router.patch('/verify-email', verifyEmailTokenAuth, verifyEmail);

/**
 * @route POST /api/v1/auth/forget-password
 * @description Send password reset link to user's email
 * @access Public
 * @param {function} controller - ['forgetPassword']
 * @param {function} validation - ['forgetPasswordAuth']
 */
router.post('/forget-password', forgetPasswordAuth, forgetPassword);

/**
 * @route POST /api/v1/auth/reset-password
 * @description Reset user password using reset password token and user mail
 * @access Public
 * @param {function} controller - ['resetPassword']
 * @param {function} validation - ['resetPasswordAuth']
 */
router.post('/reset-password', resetPasswordAuth, resetPassword);

/**
 * @route PUT /api/v1/auth/change-password
 * @description Change user password
 * @access Private
 * @param {function} controller - ['changePassword']
 * @param {function} validation - ['changePasswordAuth']
 */
router.put('/change-password', changePasswordAuth, changePassword);

// Export the router
module.exports = router;
