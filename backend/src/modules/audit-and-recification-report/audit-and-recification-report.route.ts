import { Router } from 'express';
import {
  createAuditAndRecificationReportAsManager,
  createAuditAndRecificationReportAsStandAlone,
  deleteAuditAndRecificationReport,
  getAllAuditAndRecificationReport,
  getAuditAndRecificationReportById,
  updateAuditAndRecificationReport
} from './audit-and-recification-report.controller';
import {
  validateAuditAndRecificationReportIdParam,
  validateAuditAndRecificationReportIdParamAsManager,
  validateCreateAuditAndRecificationReportAsManager,
  validateCreateAuditAndRecificationReportAsStandAlone,
  validateSearchAuditAndRecificationReportsQueries,
  validateUpdateAuditAndRecificationReport
} from './audit-and-recification-report.validation';
import { UserRole } from '../../models';
import authorizedRoles from '../../middlewares/authorized-roles';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateSearchQueries } from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();
// All routes in this router require authentication
router.use(isAuthorized());

/**
 * @route GET /api/v1/audit-and-recification-report/get-all
 * @description Get all audit and recification reports (paginated + searchable).
 * Standalone users can only access their own reports; TMs can access reports of their clients (standAloneId).
 * Query params are validated and passed to service layer for filtering, pagination, and sorting.
 * Access control is enforced based on user role and associated IDs.
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER, STANDALONE_USER)
 * @param {function} validation - ['validateSearchAuditAndRecificationReportsQueries' for TM, 'validateSearchQueries' for Standalone]
 * @param {function} controller - ['getAllAuditAndRecificationReport']
 */
router.get(
  '/get-all',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchAuditAndRecificationReportsQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllAuditAndRecificationReport
);

/**
 * @route GET /api/v1/audit-and-recification-report/get-by-id/:id
 * @description Get a single audit and recification report by ID.
 * Standalone users can only access their own reports; TMs can access reports of their clients (standAloneId).
 * Access control is enforced based on user role and associated IDs.
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER, STANDALONE_USER)
 * @param {function} validateClientForManagerMiddleware - Middleware to validate that the TM has access to the specified standAloneId (for TM only)
 * @param {function} validation - ['validateAuditAndRecificationReportIdParamAsManager' for TM, 'validateAuditAndRecificationReportIdParam' for Standalone]
 */
router.get(
  '/get-by-id/:id',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  validateAuditAndRecificationReportIdParam,
  getAuditAndRecificationReportById
);

/**
 * @route POST /api/v1/audit-and-recification-report/create-as-tm
 * @description Create a new audit and recification report as a Transport Manager.
 * The TM must specify the standAloneId of the client for whom the report is being created.
 * The createdBy field is set to the TM's user ID.
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} validateClientForManagerMiddleware - Middleware to validate that the TM has access to the specified standAloneId
 * @param {function} validation - ['validateCreateAuditAndRecificationReportAsManager']
 * @param {function} controller - ['createAuditAndRecificationReportAsManager']
 */
router.post(
  '/create-as-tm',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateCreateAuditAndRecificationReportAsManager,
  createAuditAndRecificationReportAsManager
);

/**
 * @route POST /api/v1/audit-and-recification-report/create-stand-alone
 * @description Create a new audit and recification report as a Standalone User.
 * The createdBy field is set to the user's own ID.
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (STANDALONE_USER)
 * @param {function} validation - ['validateCreateAuditAndRecificationReportAsStandAlone']
 * @param {function} controller - ['createAuditAndRecificationReportAsStandAlone']
 */
router.post(
  '/create-stand-alone',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateAuditAndRecificationReportAsStandAlone,
  createAuditAndRecificationReportAsStandAlone
);

/**
 * @route PATCH /api/v1/audit-and-recification-report/update-by-manager/:id/:standAloneId
 * @description Update an existing audit and recification report by ID.
 * Standalone users can only update their own reports; TMs can update reports of their clients (standAloneId).
 * Access control is enforced based on user role and associated IDs.
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} validateClientForManagerMiddleware - Middleware to validate that the TM has access to the specified standAloneId
 * @param {function} validation - ['validateUpdateAuditAndRecificationReport']
 * @param {function} controller - ['updateAuditAndRecificationReport']
 */
router.patch(
  '/update-by-manager/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateAuditAndRecificationReportIdParamAsManager,
  validateUpdateAuditAndRecificationReport,
  updateAuditAndRecificationReport
);

/**
 * @route PATCH /api/v1/audit-and-recification-report/update-by-standalone/:id
 * @description Update an existing audit and recification report by ID.
 * Standalone users can only update their own reports; TMs can update reports of their clients (standAloneId).
 * Access control is enforced based on user role and associated IDs.
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (STANDALONE_USER)
 * @param {function} validation - ['validateUpdateAuditAndRecificationReport']
 * @param {function} controller - ['updateAuditAndRecificationReport']
 */
router.patch(
  '/update-by-standalone/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateAuditAndRecificationReportIdParam,
  validateUpdateAuditAndRecificationReport,
  updateAuditAndRecificationReport
);

/**
 * @route DELETE /api/v1/audit-and-recification-report/delete-by-manager/:id/:standAloneId
 * @description Delete an audit and recification report by ID.
 * Standalone users can only delete their own reports; TMs can delete reports of their clients (standAloneId).
 * Access control is enforced based on user role and associated IDs.
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} validateClientForManagerMiddleware - Middleware to validate that the TM has access to the specified standAloneId
 * @param {function} validation - ['validateAuditAndRecificationReportIdParamAsManager']
 * @param {function} controller - ['deleteAuditAndRecificationReport']
 */
router.delete(
  '/delete-by-manager/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateAuditAndRecificationReportIdParamAsManager,
  deleteAuditAndRecificationReport
);

/**
 * @route DELETE /api/v1/audit-and-recification-report/delete-by-standalone/:id
 * @description Delete an audit and recification report by ID.
 * Standalone users can only delete their own reports; TMs can delete reports of their clients (standAloneId).
 * Access control is enforced based on user role and associated IDs.
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (STANDALONE_USER)
 * @param {function} validation - ['validateAuditAndRecificationReportIdParam']
 * @param {function} controller - ['deleteAuditAndRecificationReport']
 */
router.delete(
  '/delete-by-standalone/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateAuditAndRecificationReportIdParam,
  deleteAuditAndRecificationReport
);
module.exports = router;