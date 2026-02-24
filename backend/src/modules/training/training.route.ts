import { Router } from 'express';

import {
  createTrainingAsManager,
  createTrainingAsStandAlone,
  getAllTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
} from './training.controller';

import {
  validateTrainingIdParam,
  validateTrainingAndManagerIdParam,
  validateCreateTrainingAsManager,
  validateCreateTrainingAsStandAlone,
  validateUpdateTraining,
  validateSearchTrainingsQueries,
} from './training.validation';
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';

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
 * @route   POST /api/v1/training/create-training
 * @desc    Create a new training as a Transport Manager
 * @access  Transport Manager
 */
router.post(
  '/create-training',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateCreateTrainingAsManager,
  createTrainingAsManager
);

/**
 * @route   POST /api/v1/training/create-stand-alone-training
 * @desc    Create a new training as a Standalone User
 * @access  Standalone User
 */
router.post(
  '/create-stand-alone-training',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateTrainingAsStandAlone,
  createTrainingAsStandAlone
);

// ═══════════════════════════════════════════════════════════════
// UPDATE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   PATCH /api/v1/training/update-training-by-manager/:trainingId/:standAloneId
 * @desc    Update a training as a Transport Manager
 * @access  Transport Manager
 */
router.patch(
  '/update-training-by-manager/:trainingId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateTrainingAndManagerIdParam,
  validateUpdateTraining,
  updateTraining
);

/**
 * @route   PATCH /api/v1/training/update-training/:trainingId
 * @desc    Update a training as a Standalone User
 * @access  Standalone User
 */
router.patch(
  '/update-training/:trainingId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateTrainingIdParam,
  validateUpdateTraining,
  updateTraining
);

// ═══════════════════════════════════════════════════════════════
// DELETE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   DELETE /api/v1/training/delete-training-by-manager/:trainingId/:standAloneId
 * @desc    Delete a training as a Transport Manager
 * @access  Transport Manager
 */
router.delete(
  '/delete-training-by-manager/:trainingId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateTrainingAndManagerIdParam,
  deleteTraining
);

/**
 * @route   DELETE /api/v1/training/delete-training/:trainingId
 * @desc    Delete a training as a Standalone User
 * @access  Standalone User
 */
router.delete(
  '/delete-training/:trainingId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateTrainingIdParam,
  deleteTraining
);

// ═══════════════════════════════════════════════════════════════
// GET ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/training/get-trainings
 * @desc    Get all trainings (paginated + searchable)
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-trainings',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchTrainingsQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllTrainings
);

/**
 * @route   GET /api/v1/training/get-training/:trainingId
 * @desc    Get a single training with all intervalDays
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-training/:trainingId',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  validateTrainingIdParam,
  getTrainingById
);

module.exports = router;