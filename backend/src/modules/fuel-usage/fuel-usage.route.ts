// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createFuelUsage,
  updateFuelUsage,
  deleteFuelUsage,
  getFuelUsageById,
  getManyFuelUsage,
} from './fuel-usage.controller';

//Import validation from corresponding module
import { validateCreateFuelUsage, validateUpdateFuelUsage } from './fuel-usage.validation';
import {
  validateId,
  validateSearchQueries,
} from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/fuel-usage/create-fuel-usage
 * @description Create a new fuel-usage
 * @access Public
 * @param {function} validation - ['validateCreateFuelUsage']
 * @param {function} controller - ['createFuelUsage']
 */
router.post('/create-fuel-usage', validateCreateFuelUsage, createFuelUsage);

/**
 * @route PUT /api/v1/fuel-usage/update-fuel-usage/:id
 * @description Update fuel-usage information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to update
 * @param {function} validation - ['validateId', 'validateUpdateFuelUsage']
 * @param {function} controller - ['updateFuelUsage']
 */
router.put('/update-fuel-usage/:id', validateId, validateUpdateFuelUsage, updateFuelUsage);

/**
 * @route DELETE /api/v1/fuel-usage/delete-fuel-usage/:id
 * @description Delete a fuel-usage
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteFuelUsage']
 */
router.delete('/delete-fuel-usage/:id', validateId, deleteFuelUsage);

/**
 * @route GET /api/v1/fuel-usage/get-fuel-usage/many
 * @description Get multiple fuel-usages
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyFuelUsage']
 */
router.get('/get-fuel-usage/many', validateSearchQueries, getManyFuelUsage);

/**
 * @route GET /api/v1/fuel-usage/get-fuel-usage/:id
 * @description Get a fuel-usage by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getFuelUsageById']
 */
router.get('/get-fuel-usage/:id', validateId, getFuelUsageById);

// Export the router
module.exports = router;
