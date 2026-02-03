// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { 
  createTracking,
  createManyTracking,
  updateTracking,
  updateManyTracking,
  deleteTracking,
  deleteManyTracking,
  getTrackingById,
  getManyTracking
} from './tracking.controller';

//Import validation from corresponding module
import { validateCreateTracking, validateCreateManyTracking, validateUpdateTracking, validateUpdateManyTracking} from './tracking.validation';
import { validateId, validateIds, validateSearchQueries } from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/tracking/create-tracking
 * @description Create a new tracking
 * @access Public
 * @param {function} validation - ['validateCreateTracking']
 * @param {function} controller - ['createTracking']
 */
router.post("/create-tracking", validateCreateTracking, createTracking);

/**
 * @route POST /api/v1/tracking/create-tracking/many
 * @description Create multiple trackings
 * @access Public
 * @param {function} validation - ['validateCreateManyTracking']
 * @param {function} controller - ['createManyTracking']
 */
router.post("/create-tracking/many", validateCreateManyTracking, createManyTracking);

/**
 * @route PUT /api/v1/tracking/update-tracking/many
 * @description Update multiple trackings information
 * @access Public
 * @param {function} validation - ['validateIds', 'validateUpdateManyTracking']
 * @param {function} controller - ['updateManyTracking']
 */
router.put("/update-tracking/many", validateIds, validateUpdateManyTracking, updateManyTracking);

/**
 * @route PUT /api/v1/tracking/update-tracking/:id
 * @description Update tracking information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the tracking to update
 * @param {function} validation - ['validateId', 'validateUpdateTracking']
 * @param {function} controller - ['updateTracking']
 */
router.put("/update-tracking/:id", validateId, validateUpdateTracking, updateTracking);

/**
 * @route DELETE /api/v1/tracking/delete-tracking/many
 * @description Delete multiple trackings
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManyTracking']
 */
router.delete("/delete-tracking/many", validateIds, deleteManyTracking);

/**
 * @route DELETE /api/v1/tracking/delete-tracking/:id
 * @description Delete a tracking
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the tracking to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteTracking']
 */
router.delete("/delete-tracking/:id", validateId, deleteTracking);

/**
 * @route GET /api/v1/tracking/get-tracking/many
 * @description Get multiple trackings
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyTracking']
 */
router.get("/get-tracking/many", validateSearchQueries, getManyTracking);

/**
 * @route GET /api/v1/tracking/get-tracking/:id
 * @description Get a tracking by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the tracking to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getTrackingById']
 */
router.get("/get-tracking/:id", validateId, getTrackingById);

// Export the router
module.exports = router;