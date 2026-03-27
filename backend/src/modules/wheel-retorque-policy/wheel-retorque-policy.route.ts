import { Router } from 'express';

import {
  createWheelRetorquePolicyMonitoringAsManager,
  createWheelRetorquePolicyMonitoringAsStandAlone,
  deleteWheelRetorquePolicyMonitoring,
  getAllWheelRetorquePolicyMonitorings,
  getWheelRetorquePolicyMonitoringById,
  updateWheelRetorquePolicyMonitoring,
} from './wheel-retorque-policy.controller';

import { validateSearchQueries } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import {
  validateCreateWheelRetorquePolicyMonitoringAsManager,
  validateCreateWheelRetorquePolicyMonitoringAsStandAlone,
  validateSearchWheelRetorquePolicyMonitoringsQueries,
  validateUpdateWheelRetorquePolicyMonitoring,
  validateWheelRetorquePolicyMonitoringAndManagerIdParam,
  validateWheelRetorquePolicyMonitoringIdParam,
} from './wheel-retorque-policy.validation';

import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';

const router = Router();
router.use(isAuthorized());

router.post(
  '/create-wheel-retorque-policy-monitoring',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreateWheelRetorquePolicyMonitoringAsManager,
  validateClientForManagerMiddleware,
  createWheelRetorquePolicyMonitoringAsManager
);

router.post(
  '/create-stand-alone-wheel-retorque-policy-monitoring',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateWheelRetorquePolicyMonitoringAsStandAlone,
  createWheelRetorquePolicyMonitoringAsStandAlone
);

router.patch(
  '/update-wheel-retorque-policy-monitoring-by-manager/:wheelRetorquePolicyMonitoringId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateWheelRetorquePolicyMonitoringAndManagerIdParam,
  validateUpdateWheelRetorquePolicyMonitoring,
  updateWheelRetorquePolicyMonitoring
);

router.patch(
  '/update-wheel-retorque-policy-monitoring/:wheelRetorquePolicyMonitoringId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateWheelRetorquePolicyMonitoringIdParam,
  validateUpdateWheelRetorquePolicyMonitoring,
  updateWheelRetorquePolicyMonitoring
);

router.delete(
  '/delete-wheel-retorque-policy-monitoring-by-manager/:wheelRetorquePolicyMonitoringId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateWheelRetorquePolicyMonitoringAndManagerIdParam,
  deleteWheelRetorquePolicyMonitoring
);

router.delete(
  '/delete-wheel-retorque-policy-monitoring/:wheelRetorquePolicyMonitoringId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateWheelRetorquePolicyMonitoringIdParam,
  deleteWheelRetorquePolicyMonitoring
);

router.get(
  '/get-wheel-retorque-policy-monitorings',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.STANDALONE_USER && req.query?.standAloneId) {
      return ServerResponse(res, false, 400, 'standAloneId is not needed for standalone users');
    }
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      if (!req.query?.standAloneId) {
        return ServerResponse(res, false, 400, 'standAloneId is required for transport managers');
      }
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchWheelRetorquePolicyMonitoringsQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllWheelRetorquePolicyMonitorings
);

router.get(
  '/get-wheel-retorque-policy-monitoring/:wheelRetorquePolicyMonitoringId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateWheelRetorquePolicyMonitoringAndManagerIdParam,
  getWheelRetorquePolicyMonitoringById
);

router.get(
  '/get-wheel-retorque-policy-monitoring/:wheelRetorquePolicyMonitoringId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateWheelRetorquePolicyMonitoringIdParam,
  getWheelRetorquePolicyMonitoringById
);

module.exports = router;
