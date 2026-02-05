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

router.use(isAuthorized);
router.use(authorizedRoles([UserRole.SUPER_ADMIN]));

// Define route handlers
/**
 * @route POST /api/v1/subscription-duration
 * @description Create a new subscription-duration
 * @access Private
 * @param {function} validation - ['validateCreateSubscriptionDuration']
 * @param {function} controller - ['createSubscriptionDuration']
 */
router.post('/', validateCreateSubscriptionDuration, createSubscriptionDuration);

/**
 * @route PUT /api/v1/subscription-duration/:id
 * @description Update subscription-duration information
 * @param {string} id - The ID of the subscription-duration to update
 * @access Private
 * @param {function} validation - ['validateId', 'validateUpdateSubscriptionDuration']
 * @param {function} controller - ['updateSubscriptionDuration']
 */
router.put('/:id', validateId, validateUpdateSubscriptionDuration, updateSubscriptionDuration);

/**
 * @route DELETE /api/v1/subscription-duration/many
 * @description Delete multiple subscription-durations
 * @access Private
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManySubscriptionDuration']
 */
router.delete('/many', validateIds, deleteManySubscriptionDuration);

/**
 * @route DELETE /api/v1/subscription-duration/:id
 * @description Delete a subscription-duration
 * @param {string} id - The ID of the subscription-duration to delete
 * @access Private
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionDuration']
 */
router.delete('/:id', validateId, deleteSubscriptionDuration);

/**
 * @route GET /api/v1/subscription-duration
 * @description Get multiple subscription-durations
 * @access Private
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySubscriptionDuration']
 */
router.get('/', validateSearchQueries, getManySubscriptionDuration);

/**
 * @route GET /api/v1/subscription-duration/:id
 * @description Get a subscription-duration by ID
 * @param {string} id - The ID of the subscription-duration to retrieve
 * @access Private
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubscriptionDurationById']
 */
router.get('/:id', validateId, getSubscriptionDurationById);

// Export the router
module.exports = router;
