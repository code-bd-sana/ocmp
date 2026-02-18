// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { createPayment, getManyPayment, getPaymentById } from './payment.controller';

//Import validation from corresponding module
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { validateCreatePayment } from './payment.validation';

// Initialize router
const router = Router();

// Use isAuthorized middleware for all routes in this router
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/payment
 * @description Create a new payment
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) ([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER])
 * @param {function} validation - ['validateCreatePayment']
 * @param {function} controller - ['createPayment']
 */
router.post(
  '/',
  // TODO: need to remove the super admin role from this route after testing
  authorizedRoles([UserRole.SUPER_ADMIN, UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  validateCreatePayment,
  createPayment
);

/**
 * @route GET /api/v1/payment/many
 * @description Get multiple payments
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyPayment']
 */
router.get('/many', validateSearchQueries, getManyPayment);

/**
 * @route GET /api/v1/payment/:id
 * @description Get a payment by ID
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {IdOrIdsInput['id']} id - The ID of the payment to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getPaymentById']
 */
router.get('/:id', validateId, getPaymentById);

// Export the router
module.exports = router;

