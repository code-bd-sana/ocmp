import { Router } from 'express';
import isAuthorized from '../../middlewares/is-authorized';
import {
  createSubscriptionDurationValidation,
  validateCreateSubscriptionDuration,
} from './subscription-durations.validation';

const router = Router();
// Define route handlers
/**
 * @route PATCH /api/v1/user/me
 * @description Update logged in user
 * @access Private
 * @param {middleware} isAuthorized - ['isAuthorized']
 * @param {function} validation - ['validateUpdateUser']
 * @param {function} controller - ['updateUser']
 */
router.post('/', isAuthorized(), validateCreateSubscriptionDuration);
