// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { 
  createTest,
  createManyTest,
  updateTest,
  updateManyTest,
  deleteTest,
  deleteManyTest,
  getTestById,
  getManyTest
} from './test.controller';

//Import validation from corresponding module
import { validateCreateTest, validateCreateManyTest, validateUpdateTest, validateUpdateManyTest} from './test.validation';
import { validateId, validateIds, validateSearchQueries } from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/test/create-test
 * @description Create a new test
 * @access Public
 * @param {function} validation - ['validateCreateTest']
 * @param {function} controller - ['createTest']
 */
router.post("/create-test", validateCreateTest, createTest);

/**
 * @route POST /api/v1/test/create-test/many
 * @description Create multiple tests
 * @access Public
 * @param {function} validation - ['validateCreateManyTest']
 * @param {function} controller - ['createManyTest']
 */
router.post("/create-test/many", validateCreateManyTest, createManyTest);

/**
 * @route PATCH /api/v1/test/update-test/many
 * @description Update multiple tests information
 * @access Public
 * @param {function} validation - ['validateIds', 'validateUpdateManyTest']
 * @param {function} controller - ['updateManyTest']
 */
router.patch("/update-test/many", validateIds, validateUpdateManyTest, updateManyTest);

/**
 * @route PATCH /api/v1/test/update-test/:id
 * @description Update test information
 * @param {string} id - The ID of the test to update
 * @access Public
 * @param {function} validation - ['validateId', 'validateUpdateTest']
 * @param {function} controller - ['updateTest']
 */
router.patch("/update-test/:id", validateId, validateUpdateTest, updateTest);

/**
 * @route DELETE /api/v1/test/delete-test/many
 * @description Delete multiple tests
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManyTest']
 */
router.delete("/delete-test/many", validateIds, deleteManyTest);

/**
 * @route DELETE /api/v1/test/delete-test/:id
 * @description Delete a test
 * @param {string} id - The ID of the test to delete
 * @access Public
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteTest']
 */
router.delete("/delete-test/:id", validateId, deleteTest);

/**
 * @route GET /api/v1/test/get-test/many
 * @description Get multiple tests
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyTest']
 */
router.get("/get-test/many", validateSearchQueries, getManyTest);

/**
 * @route GET /api/v1/test/get-test/:id
 * @description Get a test by ID
 * @param {string} id - The ID of the test to retrieve
 * @access Public
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getTestById']
 */
router.get("/get-test/:id", validateId, getTestById);

// Export the router
module.exports = router;