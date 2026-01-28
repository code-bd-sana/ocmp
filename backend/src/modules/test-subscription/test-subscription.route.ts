// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createTestSubscription,
  createManyTestSubscription,
  updateTestSubscription,
  updateManyTestSubscription,
  deleteTestSubscription,
  deleteManyTestSubscription,
  getTestSubscriptionById,
  getManyTestSubscription,
} from './test-subscription.controller';

//Import validation from corresponding module
import {
  validateCreateTestSubscription,
  validateCreateManyTestSubscription,
  validateUpdateTestSubscription,
  validateUpdateManyTestSubscription,
} from './test-subscription.validation';
import {
  validateId,
  validateIds,
  validateSearchQueries,
} from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/test-subscription/create-test-subscription
 * @description Create a new test-subscription
 * @access Public
 * @param {function} validation - ['validateCreateTestSubscription']
 * @param {function} controller - ['createTestSubscription']
 */
router.post('/create-test-subscription', validateCreateTestSubscription, createTestSubscription);

/**
 * @route POST /api/v1/test-subscription/create-test-subscription/many
 * @description Create multiple test-subscriptions
 * @access Public
 * @param {function} validation - ['validateCreateManyTestSubscription']
 * @param {function} controller - ['createManyTestSubscription']
 */
router.post(
  '/create-test-subscription/many',
  validateCreateManyTestSubscription,
  createManyTestSubscription
);

/**
 * @route PATCH /api/v1/test-subscription/update-test-subscription/many
 * @description Update multiple test-subscriptions information
 * @access Public
 * @param {function} validation - ['validateIds', 'validateUpdateManyTestSubscription']
 * @param {function} controller - ['updateManyTestSubscription']
 */
router.patch(
  '/update-test-subscription/many',
  validateIds,
  validateUpdateManyTestSubscription,
  updateManyTestSubscription
);

/**
 * @route PATCH /api/v1/test-subscription/update-test-subscription/:id
 * @description Update test-subscription information
 * @param {string} id - The ID of the test-subscription to update
 * @access Public
 * @param {function} validation - ['validateId', 'validateUpdateTestSubscription']
 * @param {function} controller - ['updateTestSubscription']
 */
router.put(
  '/update-test-subscription/:id',
  validateId,
  validateUpdateTestSubscription,
  updateTestSubscription
);

/**
 * @route DELETE /api/v1/test-subscription/delete-test-subscription/many
 * @description Delete multiple test-subscriptions
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManyTestSubscription']
 */
router.delete('/delete-test-subscription/many', validateIds, deleteManyTestSubscription);

/**
 * @route DELETE /api/v1/test-subscription/delete-test-subscription/:id
 * @description Delete a test-subscription
 * @param {string} id - The ID of the test-subscription to delete
 * @access Public
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteTestSubscription']
 */
router.delete('/delete-test-subscription/:id', validateId, deleteTestSubscription);

/**
 * @route GET /api/v1/test-subscription/get-test-subscription/many
 * @description Get multiple test-subscriptions
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyTestSubscription']
 */
router.get('/get-test-subscription/many', validateSearchQueries, getManyTestSubscription);

/**
 * @route GET /api/v1/test-subscription/get-test-subscription/:id
 * @description Get a test-subscription by ID
 * @param {string} id - The ID of the test-subscription to retrieve
 * @access Public
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getTestSubscriptionById']
 */
router.get('/get-test-subscription/:id', validateId, getTestSubscriptionById);

// Export the router
module.exports = router;

