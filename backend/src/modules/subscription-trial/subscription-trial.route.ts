// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createSubscriptionTrial,
  deleteSubscriptionTrial,
  getManySubscriptionTrial,
  getSubscriptionTrialById,
  updateSubscriptionTrial,
} from './subscription-trial.controller';

//Import validation from corresponding module
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import isAuthorized from '../../middlewares/is-authorized';
import { getTrialRemainingDaysController } from './subscription-trial.controller';
import { validateUpdateSubscriptionTrial } from './subscription-trial.validation';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/subscription-trial/create-subscription-trial
 * @description Create a new subscription-trial
 * @access Private
 * @param {function} validation - ['validateCreateSubscriptionTrial']
 * @param {function} controller - ['createSubscriptionTrial']
 */
router.post('/', isAuthorized, createSubscriptionTrial);

/**
 * @route PATCH /api/v1/subscription-trial/update-subscription-trial/:id
 * @description Update subscription-trial information
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-trial to update
 * @param {function} validation - ['validateId', 'validateUpdateSubscriptionTrial']
 * @param {function} controller - ['updateSubscriptionTrial']
 */
router.patch('/:id', validateId, validateUpdateSubscriptionTrial, updateSubscriptionTrial);

/**
 * @route DELETE /api/v1/subscription-trial/delete-subscription-trial/:id
 * @description Delete a subscription-trial
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-trial to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionTrial']
 */
router.delete('/:id', validateId, deleteSubscriptionTrial);

/**
 * @route GET /api/v1/subscription-trial/get-subscription-trial/many
 * @description Get multiple subscription-trials
 * @access Private
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySubscriptionTrial']
 */
router.get('/many', validateSearchQueries, getManySubscriptionTrial);

/**
 * @route GET /api/v1/subscription-trial/remaining
 * @description Get remaining trial days for authenticated user
 * @access Private
 */
router.get('/remaining', isAuthorized, getTrialRemainingDaysController);

/**
 * @route GET /api/v1/subscription-trial/get-subscription-trial/:id
 * @description Get a subscription-trial by ID
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-trial to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubscriptionTrialById']
 */
router.get('/:id', validateId, getSubscriptionTrialById);

// Export the router
module.exports = router;

