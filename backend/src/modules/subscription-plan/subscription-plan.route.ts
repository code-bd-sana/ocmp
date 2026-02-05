// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createSubscriptionPlan,
  deleteManySubscriptionPlan,
  deleteSubscriptionPlan,
  getManySubscriptionPlan,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
} from './subscription-plan.controller';

//Import validation from corresponding module
import {
  validateId,
  validateIds,
  validateSearchQueries,
} from '../../handlers/common-zod-validator';
import isAuthorized from '../../middlewares/is-authorized';
import {
  validateCreateSubscriptionPlan,
  validateUpdateSubscriptionPlan,
} from './subscription-plan.validation';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/subscription-plan/create-subscription-plan
 * @description Create a new subscription-plan
 * @access Public
 * @param {function} validation - ['validateCreateSubscriptionPlan']
 * @param {function} controller - ['createSubscriptionPlan']
 */
router.post('/', validateCreateSubscriptionPlan, isAuthorized, createSubscriptionPlan);

/**
 * @route PATCH /api/v1/subscription-plan/update-subscription-plan/:id
 * @description Update subscription-plan information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to update
 * @param {function} validation - ['validateId', 'validateUpdateSubscriptionPlan']
 * @param {function} controller - ['updateSubscriptionPlan']
 */
router.patch('/:id', validateId, validateUpdateSubscriptionPlan, updateSubscriptionPlan);

/**
 * @route DELETE /api/v1/subscription-plan/delete-subscription-plan/many
 * @description Delete multiple subscription-plans
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManySubscriptionPlan']
 */
router.delete('/delete-subscription-plan/many', validateIds, deleteManySubscriptionPlan);

/**
 * @route DELETE /api/v1/subscription-plan/delete-subscription-plan/:id
 * @description Delete a subscription-plan
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionPlan']
 */
router.delete('/delete-subscription-plan/:id', validateId, deleteSubscriptionPlan);

/**
 * @route GET /api/v1/subscription-plan/get-subscription-plan/many
 * @description Get multiple subscription-plans
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySubscriptionPlan']
 */
router.get('/', validateSearchQueries, getManySubscriptionPlan);

/**
 * @route GET /api/v1/subscription-plan/get-subscription-plan/:id
 * @description Get a subscription-plan by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubscriptionPlanById']
 */
router.get('/:id', validateId, getSubscriptionPlanById);

// Export the router
module.exports = router;
