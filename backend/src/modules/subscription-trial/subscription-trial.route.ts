// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { createSubscriptionTrial } from './subscription-trial.controller';

//Import validation from corresponding module
import checkSubscriptionValidity from '../../middlewares/check-subscription-validity';
import isAuthorized from '../../middlewares/is-authorized';

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
router.post('/', isAuthorized(), checkSubscriptionValidity, createSubscriptionTrial);

// Export the router
module.exports = router;
