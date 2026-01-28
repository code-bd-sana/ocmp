// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createSubscriptionDuration,
  createManySubscriptionDuration,
  updateSubscriptionDuration,
  updateManySubscriptionDuration,
  deleteSubscriptionDuration,
  deleteManySubscriptionDuration,
  getSubscriptionDurationById,
  getManySubscriptionDuration,
} from './subscription-duration.controller';

//Import validation from corresponding module
import {
  validateCreateSubscriptionDuration,
  validateCreateManySubscriptionDuration,
  validateUpdateSubscriptionDuration,
  validateUpdateManySubscriptionDuration,
} from './subscription-duration.validation';
import {
  validateId,
  validateIds,
  validateSearchQueries,
} from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/subscription-duration/create-subscription-duration
 * @description Create a new subscription-duration
 * @access Public
 * @param {function} validation - ['validateCreateSubscriptionDuration']
 * @param {function} controller - ['createSubscriptionDuration']
 */
router.post(
  '/create-subscription-duration',
  validateCreateSubscriptionDuration,
  createSubscriptionDuration
);

/**
 * @route POST /api/v1/subscription-duration/create-subscription-duration/many
 * @description Create multiple subscription-durations
 * @access Public
 * @param {function} validation - ['validateCreateManySubscriptionDuration']
 * @param {function} controller - ['createManySubscriptionDuration']
 */
router.post(
  '/create-subscription-duration/many',
  validateCreateManySubscriptionDuration,
  createManySubscriptionDuration
);

/**
 * @route PATCH /api/v1/subscription-duration/update-subscription-duration/many
 * @description Update multiple subscription-durations information
 * @access Public
 * @param {function} validation - ['validateIds', 'validateUpdateManySubscriptionDuration']
 * @param {function} controller - ['updateManySubscriptionDuration']
 */
router.patch(
  '/update-subscription-duration/many',
  validateIds,
  validateUpdateManySubscriptionDuration,
  updateManySubscriptionDuration
);

/**
 * @route PATCH /api/v1/subscription-duration/update-subscription-duration/:id
 * @description Update subscription-duration information
 * @param {string} id - The ID of the subscription-duration to update
 * @access Public
 * @param {function} validation - ['validateId', 'validateUpdateSubscriptionDuration']
 * @param {function} controller - ['updateSubscriptionDuration']
 */
router.put(
  '/update-subscription-duration/:id',
  validateId,
  validateUpdateSubscriptionDuration,
  updateSubscriptionDuration
);

/**
 * @route DELETE /api/v1/subscription-duration/delete-subscription-duration/many
 * @description Delete multiple subscription-durations
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManySubscriptionDuration']
 */
router.delete('/delete-subscription-duration/many', validateIds, deleteManySubscriptionDuration);

/**
 * @route DELETE /api/v1/subscription-duration/delete-subscription-duration/:id
 * @description Delete a subscription-duration
 * @param {string} id - The ID of the subscription-duration to delete
 * @access Public
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionDuration']
 */
router.delete('/delete-subscription-duration/:id', validateId, deleteSubscriptionDuration);

/**
 * @route GET /api/v1/subscription-duration/get-subscription-duration/many
 * @description Get multiple subscription-durations
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySubscriptionDuration']
 */
router.get('/get-subscription-duration/many', validateSearchQueries, getManySubscriptionDuration);

/**
 * @route GET /api/v1/subscription-duration/get-subscription-duration/:id
 * @description Get a subscription-duration by ID
 * @param {string} id - The ID of the subscription-duration to retrieve
 * @access Public
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubscriptionDurationById']
 */
router.get('/get-subscription-duration/:id', validateId, getSubscriptionDurationById);

// Export the router
module.exports = router;
