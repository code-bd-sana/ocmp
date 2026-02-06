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
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import {
  validateCreateSubscriptionPlan,
  validateUpdateSubscriptionPlan,
} from './subscription-plan.validation';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/subscription-plan
 * @description Create a new subscription-plan
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {function} validation - ['validateCreateSubscriptionPlan']
 * @param {function} controller - ['createSubscriptionPlan']
 */
router.post(
  '/',
  isAuthorized,
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateCreateSubscriptionPlan,
  createSubscriptionPlan
);

/**
 * @route PATCH /api/v1/subscription-plan/:id
 * @description Update subscription-plan information
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to update
 * @param {function} validation - ['validateId', 'validateUpdateSubscriptionPlan']
 * @param {function} controller - ['updateSubscriptionPlan']
 */
router.patch(
  '/:id',
  isAuthorized,
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateId,
  validateUpdateSubscriptionPlan,
  updateSubscriptionPlan
);

/**
 * @route DELETE /api/v1/subscription-plan/many
 * @description Delete multiple subscription-plans
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManySubscriptionPlan']
 */
router.delete(
  '/many',
  isAuthorized,
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateIds,
  deleteManySubscriptionPlan
);

/**
 * @route DELETE /api/v1/subscription-plan/:id
 * @description Delete a subscription-plan
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionPlan']
 */
router.delete(
  '/:id',
  isAuthorized,
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateId,
  deleteSubscriptionPlan
);

/**
 * @route GET /api/v1/subscription-plan
 * @description Get multiple subscription-plans
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySubscriptionPlan']
 */
router.get(
  '/',
  isAuthorized,
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateSearchQueries,
  getManySubscriptionPlan
);

/**
 * @route GET /api/v1/subscription-plan/:id
 * @description Get a subscription-plan by ID
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubscriptionPlanById']
 */
router.get(
  '/:id',
  isAuthorized,
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateId,
  getSubscriptionPlanById
);

// Export the router
module.exports = router;
