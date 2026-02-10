// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createSubscriptionDuration,
  deleteManySubscriptionDuration,
  deleteSubscriptionDuration,
  getManySubscriptionDuration,
  getSubscriptionDurationById,
  updateSubscriptionDuration,
} from './subscription-duration.controller';

//Import validation from corresponding module
import {
  validateId,
  validateIds,
  validateSearchQueries,
} from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import {
  validateCreateSubscriptionDuration,
  validateUpdateSubscriptionDuration,
} from './subscription-duration.validation';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/subscription-duration
 * @description Create a new subscription-duration
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {function} validation - ['validateCreateSubscriptionDuration']
 * @param {function} controller - ['createSubscriptionDuration']
 */
router.post(
  '/',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateCreateSubscriptionDuration,
  createSubscriptionDuration
);

/**
 * @route PUT /api/v1/subscription-duration/:id
 * @description Update subscription-duration information
 * @param {string} id - The ID of the subscription-duration to update
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s)
 * @param {function} validation - ['validateId', 'validateUpdateSubscriptionDuration']
 * @param {function} controller - ['updateSubscriptionDuration']
 */
router.put(
  '/:id',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateId,
  validateUpdateSubscriptionDuration,
  updateSubscriptionDuration
);

/**
 * @route DELETE /api/v1/subscription-duration/many
 * @description Delete multiple subscription-durations
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s)
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManySubscriptionDuration']
 */
router.delete(
  '/many',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateIds,
  deleteManySubscriptionDuration
);

/**
 * @route DELETE /api/v1/subscription-duration/:id
 * @description Delete a subscription-duration
 * @param {string} id - The ID of the subscription-duration to delete
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s)
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionDuration']
 */
router.delete(
  '/:id',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateId,
  deleteSubscriptionDuration
);

/**
 * @route GET /api/v1/subscription-duration
 * @description Get multiple subscription-durations
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySubscriptionDuration']
 */
router.get(
  '/',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateSearchQueries,
  getManySubscriptionDuration
);

/**
 * @route GET /api/v1/subscription-duration/:id
 * @description Get a subscription-duration by ID
 * @param {string} id - The ID of the subscription-duration to retrieve
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubscriptionDurationById']
 */
router.get(
  '/:id',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateId,
  getSubscriptionDurationById
);

// Export the router
module.exports = router;
