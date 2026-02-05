// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { 
  createSubscriptionPricing,
  createManySubscriptionPricing,
  updateSubscriptionPricing,
  updateManySubscriptionPricing,
  deleteSubscriptionPricing,
  deleteManySubscriptionPricing,
  getSubscriptionPricingById,
  getManySubscriptionPricing
} from './subscription-pricing.controller';

//Import validation from corresponding module
import { validateCreateSubscriptionPricing, validateCreateManySubscriptionPricing, validateUpdateSubscriptionPricing, validateUpdateManySubscriptionPricing} from './subscription-pricing.validation';
import { validateId, validateIds, validateSearchQueries } from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/subscription-pricing/create-subscription-pricing
 * @description Create a new subscription-pricing
 * @access Public
 * @param {function} validation - ['validateCreateSubscriptionPricing']
 * @param {function} controller - ['createSubscriptionPricing']
 */
router.post("/create-subscription-pricing", validateCreateSubscriptionPricing, createSubscriptionPricing);

/**
 * @route POST /api/v1/subscription-pricing/create-subscription-pricing/many
 * @description Create multiple subscription-pricings
 * @access Public
 * @param {function} validation - ['validateCreateManySubscriptionPricing']
 * @param {function} controller - ['createManySubscriptionPricing']
 */
router.post("/create-subscription-pricing/many", validateCreateManySubscriptionPricing, createManySubscriptionPricing);

/**
 * @route PUT /api/v1/subscription-pricing/update-subscription-pricing/many
 * @description Update multiple subscription-pricings information
 * @access Public
 * @param {function} validation - ['validateIds', 'validateUpdateManySubscriptionPricing']
 * @param {function} controller - ['updateManySubscriptionPricing']
 */
router.put("/update-subscription-pricing/many", validateIds, validateUpdateManySubscriptionPricing, updateManySubscriptionPricing);

/**
 * @route PUT /api/v1/subscription-pricing/update-subscription-pricing/:id
 * @description Update subscription-pricing information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to update
 * @param {function} validation - ['validateId', 'validateUpdateSubscriptionPricing']
 * @param {function} controller - ['updateSubscriptionPricing']
 */
router.put("/update-subscription-pricing/:id", validateId, validateUpdateSubscriptionPricing, updateSubscriptionPricing);

/**
 * @route DELETE /api/v1/subscription-pricing/delete-subscription-pricing/many
 * @description Delete multiple subscription-pricings
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManySubscriptionPricing']
 */
router.delete("/delete-subscription-pricing/many", validateIds, deleteManySubscriptionPricing);

/**
 * @route DELETE /api/v1/subscription-pricing/delete-subscription-pricing/:id
 * @description Delete a subscription-pricing
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionPricing']
 */
router.delete("/delete-subscription-pricing/:id", validateId, deleteSubscriptionPricing);

/**
 * @route GET /api/v1/subscription-pricing/get-subscription-pricing/many
 * @description Get multiple subscription-pricings
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySubscriptionPricing']
 */
router.get("/get-subscription-pricing/many", validateSearchQueries, getManySubscriptionPricing);

/**
 * @route GET /api/v1/subscription-pricing/get-subscription-pricing/:id
 * @description Get a subscription-pricing by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubscriptionPricingById']
 */
router.get("/get-subscription-pricing/:id", validateId, getSubscriptionPricingById);

// Export the router
module.exports = router;