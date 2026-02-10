// Import Router from express
import { Router } from 'express';

//Import validation from corresponding module
import isAuthorized from '../../middlewares/is-authorized';
import { getSubscriptionRemainingDaysController } from './subscription-remain.controller';

// Initialize router
const router = Router();

/**
 * @route GET /api/v1/subscription-remain/remaining
 * @description Get remaining subscription days for authenticated user
 * @access Private
 * @param {function} controller - ['getSubscriptionRemainingDaysController']
 */
router.get('/remaining', isAuthorized(), getSubscriptionRemainingDaysController);

// Export the router
module.exports = router;
