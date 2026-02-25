import { Router } from 'express';

import {
  createPolicyProcedureAsManager,
  createPolicyProcedureAsStandAlone,
  getAllPolicyProcedures,
  getPolicyProcedureById,
  updatePolicyProcedure,
  deletePolicyProcedure,
} from './policy-procedure.controller';

import {
  validatePolicyProcedureIdParam,
  validatePolicyProcedureAndManagerIdParam,
  validateCreatePolicyProcedureAsManager,
  validateCreatePolicyProcedureAsStandAlone,
  validateUpdatePolicyProcedure,
  validateSearchPolicyProceduresQueries,
} from './policy-procedure.validation';
import { validateSearchQueries } from '../../handlers/common-zod-validator';

import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';

const router = Router();
router.use(isAuthorized());

// ═══════════════════════════════════════════════════════════════
// CREATE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/policy-procedure/create-policy-procedure
 * @desc    Create a policy procedure as a Transport Manager
 * @access  Transport Manager
 */
router.post(
  '/create-policy-procedure',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateCreatePolicyProcedureAsManager,
  createPolicyProcedureAsManager
);

/**
 * @route   POST /api/v1/policy-procedure/create-stand-alone-policy-procedure
 * @desc    Create a policy procedure as a Standalone User
 * @access  Standalone User
 */
router.post(
  '/create-stand-alone-policy-procedure',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreatePolicyProcedureAsStandAlone,
  createPolicyProcedureAsStandAlone
);

// ═══════════════════════════════════════════════════════════════
// UPDATE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   PATCH /api/v1/policy-procedure/update-policy-procedure-by-manager/:policyProcedureId/:standAloneId
 * @desc    Update a policy procedure as a Transport Manager
 * @access  Transport Manager
 */
router.patch(
  '/update-policy-procedure-by-manager/:policyProcedureId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validatePolicyProcedureAndManagerIdParam,
  validateUpdatePolicyProcedure,
  updatePolicyProcedure
);

/**
 * @route   PATCH /api/v1/policy-procedure/update-policy-procedure/:policyProcedureId
 * @desc    Update a policy procedure as a Standalone User
 * @access  Standalone User
 */
router.patch(
  '/update-policy-procedure/:policyProcedureId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validatePolicyProcedureIdParam,
  validateUpdatePolicyProcedure,
  updatePolicyProcedure
);

// ═══════════════════════════════════════════════════════════════
// DELETE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   DELETE /api/v1/policy-procedure/delete-policy-procedure-by-manager/:policyProcedureId/:standAloneId
 * @desc    Delete a policy procedure as a Transport Manager
 * @access  Transport Manager
 */
router.delete(
  '/delete-policy-procedure-by-manager/:policyProcedureId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validatePolicyProcedureAndManagerIdParam,
  deletePolicyProcedure
);

/**
 * @route   DELETE /api/v1/policy-procedure/delete-policy-procedure/:policyProcedureId
 * @desc    Delete a policy procedure as a Standalone User
 * @access  Standalone User
 */
router.delete(
  '/delete-policy-procedure/:policyProcedureId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validatePolicyProcedureIdParam,
  deletePolicyProcedure
);

// ═══════════════════════════════════════════════════════════════
// GET ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/policy-procedure/get-policy-procedures
 * @desc    Get all policy procedures (paginated + searchable)
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-policy-procedures',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchPolicyProceduresQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllPolicyProcedures
);

/**
 * @route   GET /api/v1/policy-procedure/get-policy-procedure/:policyProcedureId
 * @desc    Get a single policy procedure by ID
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-policy-procedure/:policyProcedureId',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  validatePolicyProcedureIdParam,
  getPolicyProcedureById
);

module.exports = router;