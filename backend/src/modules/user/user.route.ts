// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { getUserById, getUserProfile, updateUser } from './user.controller';

//Import validation from corresponding module
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { validateUpdateUser } from './user.validation';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route PATCH /api/v1/user/me
 * @description Update logged in user
 * @access Private
 * @param {middleware} isAuthorized - ['isAuthorized']
 * @param {function} validation - ['validateUpdateUser']
 * @param {function} controller - ['updateUser']
 */
router.patch('/me', isAuthorized, validateUpdateUser, updateUser);

/**
 * @route GET /api/v1/user/me
 * @description Get logged in user profile
 * @access Private
 * @param {middleware} isAuthorized - ['isAuthorized']
 * @param {function} controller - ['getUserProfile']
 */
router.get('/me', isAuthorized, getUserProfile);

/**
 * @route GET /api/v1/user/:id
 * @description Get user by ID
 * @access Private
 * @param {middleware} isAuthorized - ['isAuthorized']
 * @param {function} controller - ['getUserById']
 */
router.get('/:id', isAuthorized, authorizedRoles([UserRole.SUPER_ADMIN]), getUserById);

// Export the router
module.exports = router;
