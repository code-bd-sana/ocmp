import { Router } from 'express';

import {
  createTraining,
  getAllTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
} from './training.controller';

import {
  validateCreateTraining,
  validateUpdateTraining,
  validateTrainingIdParam,
} from './training.validation';

import isAuthorized from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';

const router = Router();

// All routes require TM authentication
const tmOnly = [isAuthorized(), authorizedRoles([UserRole.TRANSPORT_MANAGER])];

/**
 * @route   GET /api/v1/training
 * @desc    Get all trainings for the authenticated TM (summary — first intervalDay only)
 * @access  Transport Manager
 */
router.get('/', ...tmOnly, getAllTrainings);

/**
 * @route   GET /api/v1/training/:trainingId
 * @desc    Get a single training with all intervalDays
 * @access  Transport Manager
 */
router.get('/:trainingId', ...tmOnly, validateTrainingIdParam, getTrainingById);

/**
 * @route   POST /api/v1/training
 * @desc    Create a new training sheet
 * @access  Transport Manager
 */
router.post('/', ...tmOnly, validateCreateTraining, createTraining);

/**
 * @route   PATCH /api/v1/training/:trainingId
 * @desc    Update a training
 * @access  Transport Manager
 */
router.patch('/:trainingId', ...tmOnly, validateTrainingIdParam, validateUpdateTraining, updateTraining);

/**
 * @route   DELETE /api/v1/training/:trainingId
 * @desc    Delete a training
 * @access  Transport Manager
 */
router.delete('/:trainingId', ...tmOnly, validateTrainingIdParam, deleteTraining);

module.exports = router;