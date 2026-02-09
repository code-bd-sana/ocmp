// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createSubscriptionTrial,
  deleteSubscriptionTrial,
  getSubscriptionTrialById,
} from './subscription-trial.controller';

//Import validation from corresponding module
import { validateId } from '../../handlers/common-zod-validator';
import isAuthorized from '../../middlewares/is-authorized';
import { getTrialRemainingDaysController } from './subscription-trial.controller';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/subscription-trial
 * @description Create a new subscription-trial
 * @access Private
 * @param {function} validation - ['validateCreateSubscriptionTrial']
 * @param {function} controller - ['createSubscriptionTrial']
 */
router.post('/', isAuthorized, createSubscriptionTrial);

/**
 * @route DELETE /api/v1/subscription-trial/:id
 * @description Delete a subscription-trial
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-trial to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionTrial']
 */
router.delete('/:id', validateId, deleteSubscriptionTrial);

/**
 * @route GET /api/v1/subscription-trial/remaining
 * @description Get remaining trial days for authenticated user
 * @access Private
 */
router.get('/remaining', isAuthorized, getTrialRemainingDaysController);

/**
 * @route GET /api/v1/subscription-trial/:id
 * @description Get a subscription-trial by ID
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-trial to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubscriptionTrialById']
 */
router.get('/:id', validateId, getSubscriptionTrialById);

// Export the router
module.exports = router;
