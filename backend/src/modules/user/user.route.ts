// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { 
  createUser,
  createManyUser,
  updateUser,
  updateManyUser,
  deleteUser,
  deleteManyUser,
  getUserById,
  getManyUser
} from './user.controller';

//Import validation from corresponding module
import { validateCreateUser, validateCreateManyUser, validateUpdateUser, validateUpdateManyUser} from './user.validation';
import { validateId, validateIds, validateSearchQueries } from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/user/create-user
 * @description Create a new user
 * @access Public
 * @param {function} controller - ['createUser']
 * @param {function} validation - ['validateCreateUser']
 */
router.post("/create-user", validateCreateUser, createUser);

/**
 * @route POST /api/v1/user/create-user/many
 * @description Create multiple users
 * @access Public
 * @param {function} controller - ['createManyUser']
 * @param {function} validation - ['validateCreateManyUser']
 */
router.post("/create-user/many", validateCreateManyUser, createManyUser);

/**
 * @route PATCH /api/v1/user/update-user/many
 * @description Update multiple users information
 * @access Public
 * @param {function} controller - ['updateManyUser']
 * @param {function} validation - ['validateIds', 'validateUpdateManyUser']
 */
router.patch("/update-user/many", validateIds, validateUpdateManyUser, updateManyUser);

/**
 * @route PATCH /api/v1/user/update-user/:id
 * @description Update user information
 * @param {string} id - The ID of the user to update
 * @access Public
 * @param {function} controller - ['updateUser']
 * @param {function} validation - ['validateId', 'validateUpdateUser']
 */
router.patch("/update-user/:id", validateId, validateUpdateUser, updateUser);

/**
 * @route DELETE /api/v1/user/delete-user/many
 * @description Delete multiple users
 * @access Public
 * @param {function} controller - ['deleteManyUser']
 * @param {function} validation - ['validateIds']
 */
router.delete("/delete-user/many", validateIds, deleteManyUser);

/**
 * @route DELETE /api/v1/user/delete-user/:id
 * @description Delete a user
 * @param {string} id - The ID of the user to delete
 * @access Public
 * @param {function} controller - ['deleteUser']
 * @param {function} validation - ['validateId']
 */
router.delete("/delete-user/:id", validateId, deleteUser);

/**
 * @route GET /api/v1/user/get-user/many
 * @description Get multiple users
 * @access Public
 * @param {function} controller - ['getManyUser']
 * @param {function} validation - ['validateSearchQueries']
 */
router.get("/get-user/many", validateSearchQueries, getManyUser);

/**
 * @route GET /api/v1/user/get-user/:id
 * @description Get a user by ID
 * @param {string} id - The ID of the user to retrieve
 * @access Public
 * @param {function} controller - ['getUserById']
 * @param {function} validation - ['validateId']
 */
router.get("/get-user/:id", validateId, getUserById);

// Export the router
module.exports = router;
