// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  updateContactLog,
  getContactLogById,
  getManyContactLog,
  createContactLogAsManager,
  createContactLogAsStandalone,
  deleteContactLog,
} from './contact-log.controller';

//Import validation from corresponding module
import {
  validateCreateContactLogAsManager,
  validateCreateContactLogAsStandalone,
  validateDeleteContactLogIds,
  validateGetContactLogByIdParams,
  validateSearchContactLogQueries,
  validateUpdateContactLog,
  validateUpdateContactLogIds,
} from './contact-log.validation';
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import ServerResponse from '../../helpers/responses/custom-response';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/contact-log/create-as-manager
 * @description Create a new contact-log as transport manager
 * @access protected (Transport Manager)
 * @param {function} validation - ['validateCreateContactLogAsManager']
 * @param {function} controller - ['createContactLogAsManager']
 */
router.post(
  '/create-as-manager',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateCreateContactLogAsManager,
  createContactLogAsManager
);

// Define route handlers
/**
 * @route POST /api/v1/contact-log/create-as-standalone
 * @description Create a new contact-log as standalone user
 * @access protected (Standalone User)
 * @param {function} validation - ['validateCreateContactLogAsStandalone']
 * @param {function} controller - ['createContactLogAsStandalone']
 */
router.post(
  '/create-as-standalone',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateContactLogAsStandalone,
  createContactLogAsStandalone
);

/**
 * @route PATCH /api/v1/contact-log/update-as-manager/:id/:standAloneId
 * @description Update a contact-log by ID (Transport Manager can only update contact-logs of their approved clients)
 * @access Private (Transport Manager)
 * @param {function} validation - ['validateUpdateContactLogIds', 'validateUpdateContactLog']
 * @param {function} controller - ['updateContactLog']
 */
router.patch(
  '/update-as-manager/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateUpdateContactLog,
  updateContactLog
);

/**
 * @route PATCH /api/v1/contact-log/update-as-standalone/:id
 * @description Update a contact-log by ID (Standalone User)
 * @access Private (Standalone User)
 * @param {function} validation - ['validateId', 'validateUpdateContactLog']
 * @param {function} controller - ['updateContactLog']
 */
router.patch(
  '/update-as-standalone/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateId,
  validateUpdateContactLog,
  updateContactLog
);

/**
 * @route DELETE /api/v1/contact-log/:id/:standAloneId
 * @description Delete a contact-log
 * @access private (Transport Manager)
 * @param {IdOrIdsInput['id']} id - The ID of the contact-log to delete
 * @param {function} validation - ['validateUpdateContactLogIds']
 * @param {function} controller - ['deleteContactLog']
 */
router.delete(
  '/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateDeleteContactLogIds,
  deleteContactLog
);

/**
 * @route DELETE /api/v1/contact-log/:id
 * @description Delete a contact-log
 * @access private (Standalone User)
 * @param {IdOrIdsInput['id']} id - The ID of the contact-log to delete
 * @param {function} validation - ['validateUpdateContactLogIds']
 * @param {function} controller - ['deleteContactLog']
 */
router.delete('/:id', authorizedRoles([UserRole.STANDALONE_USER]), validateId, deleteContactLog);

/**
 * @route GET /api/v1/contact-log/get-all
 * @description Get multiple contact-logs
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyContactLog']
 */
(router.get(
  '/get-all',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.STANDALONE_USER && req.query?.standAloneId) {
      return ServerResponse(
        res,
        false,
        403,
        'Forbidden: standAloneId is only allowed for transport managers'
      );
    }
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchContactLogQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyContactLog
),
  /**
   * @route GET /api/v1/contact-log/:id/:standAloneId
   * @description Get a contact-log by ID
   * @access Private (Transport Manager or Standalone User)
   * @param {IdOrIdsInput['id']} id - The ID of the contact-log to retrieve
   * @param {function} validation - ['validateGetContactLogByIdParams']
   * @param {function} controller - ['getContactLogById']
   */
  router.get(
    '/:id/:standAloneId',
    authorizedRoles([UserRole.TRANSPORT_MANAGER]),
    validateClientForManagerMiddleware,
    validateGetContactLogByIdParams,
    getContactLogById
  ));

/**
 * @route GET /api/v1/contact-log/:id
 * @description Get a contact-log by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the contact-log to retrieve
 * @param {function} validation - ['validateGetContactLogByIdParams']
 * @param {function} controller - ['getContactLogById']
 */
router.get(
  '/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateGetContactLogByIdParams,
  getContactLogById
);

// Export the router
module.exports = router;

