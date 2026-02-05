// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { 
  createTesting,
  createManyTesting,
  updateTesting,
  updateManyTesting,
  deleteTesting,
  deleteManyTesting,
  getTestingById,
  getManyTesting
} from './testing.controller';

//Import validation from corresponding module
import { validateCreateTesting, validateCreateManyTesting, validateUpdateTesting, validateUpdateManyTesting} from './testing.validation';
import { validateId, validateIds, validateSearchQueries } from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/testing/create-testing
 * @description Create a new testing
 * @access Public
 * @param {function} validation - ['validateCreateTesting']
 * @param {function} controller - ['createTesting']
 */
router.post("/create-testing", validateCreateTesting, createTesting);

/**
 * @route POST /api/v1/testing/create-testing/many
 * @description Create multiple testings
 * @access Public
 * @param {function} validation - ['validateCreateManyTesting']
 * @param {function} controller - ['createManyTesting']
 */
router.post("/create-testing/many", validateCreateManyTesting, createManyTesting);

/**
 * @route PUT /api/v1/testing/update-testing/many
 * @description Update multiple testings information
 * @access Public
 * @param {function} validation - ['validateIds', 'validateUpdateManyTesting']
 * @param {function} controller - ['updateManyTesting']
 */
router.put("/update-testing/many", validateIds, validateUpdateManyTesting, updateManyTesting);

/**
 * @route PUT /api/v1/testing/update-testing/:id
 * @description Update testing information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the testing to update
 * @param {function} validation - ['validateId', 'validateUpdateTesting']
 * @param {function} controller - ['updateTesting']
 */
router.put("/update-testing/:id", validateId, validateUpdateTesting, updateTesting);

/**
 * @route DELETE /api/v1/testing/delete-testing/many
 * @description Delete multiple testings
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManyTesting']
 */
router.delete("/delete-testing/many", validateIds, deleteManyTesting);

/**
 * @route DELETE /api/v1/testing/delete-testing/:id
 * @description Delete a testing
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the testing to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteTesting']
 */
router.delete("/delete-testing/:id", validateId, deleteTesting);

/**
 * @route GET /api/v1/testing/get-testing/many
 * @description Get multiple testings
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyTesting']
 */
router.get("/get-testing/many", validateSearchQueries, getManyTesting);

/**
 * @route GET /api/v1/testing/get-testing/:id
 * @description Get a testing by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the testing to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getTestingById']
 */
router.get("/get-testing/:id", validateId, getTestingById);

// Export the router
module.exports = router;