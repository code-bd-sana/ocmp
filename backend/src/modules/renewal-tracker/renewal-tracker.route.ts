import { NextFunction, Request, Response, Router } from 'express';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  createRenewalTrackerAsManager,
  createRenewalTrackerAsStandAlone,
  deleteRenewalTrackerAsManager,
  deleteRenewalTrackerAsStandAlone,
  getManyRenewalTrackerAsManager,
  getManyRenewalTrackerAsStandAlone,
  getRenewalTrackerByIdAsManager,
  getRenewalTrackerByIdAsStandAlone,
  updateRenewalTrackerAsManager,
  updateRenewalTrackerAsStandAlone,
} from './renewal-tracker.controller';
import {
  validateCreateRenewalTrackerAsManager,
  validateCreateRenewalTrackerAsStandAlone,
  validateRenewalTrackerAndManagerIdParam,
  validateRenewalTrackerIdParam,
  validateSearchRenewalTrackerQueries,
  validateUpdateRenewalTracker,
} from './renewal-tracker.validation';

const router = Router();

router.use(isAuthorized());

router.post(
  '/create-renewal-tracker',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreateRenewalTrackerAsManager,
  validateClientForManagerMiddleware,
  createRenewalTrackerAsManager
);

router.post(
  '/create-stand-alone-renewal-tracker',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateRenewalTrackerAsStandAlone,
  createRenewalTrackerAsStandAlone
);

router.get(
  '/get-renewal-tracker/many',
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  validateSearchRenewalTrackerQueries,
  (req: Request, _res: Response, next: NextFunction) => {
    if ((req as any).user?.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, _res, next);
    }
    next();
  },
  (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user?.role === UserRole.TRANSPORT_MANAGER) {
      return getManyRenewalTrackerAsManager(req, res, next);
    }
    return getManyRenewalTrackerAsStandAlone(req, res, next);
  }
);

router.get(
  '/get-renewal-tracker/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateRenewalTrackerAndManagerIdParam,
  validateClientForManagerMiddleware,
  getRenewalTrackerByIdAsManager
);

router.get(
  '/get-renewal-tracker/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateRenewalTrackerIdParam,
  getRenewalTrackerByIdAsStandAlone
);

router.patch(
  '/update-renewal-tracker/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateRenewalTrackerAndManagerIdParam,
  validateUpdateRenewalTracker,
  validateClientForManagerMiddleware,
  updateRenewalTrackerAsManager
);

router.patch(
  '/update-renewal-tracker/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateRenewalTrackerIdParam,
  validateUpdateRenewalTracker,
  updateRenewalTrackerAsStandAlone
);

router.delete(
  '/delete-renewal-tracker/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateRenewalTrackerAndManagerIdParam,
  validateClientForManagerMiddleware,
  deleteRenewalTrackerAsManager
);

router.delete(
  '/delete-renewal-tracker/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateRenewalTrackerIdParam,
  deleteRenewalTrackerAsStandAlone
);

module.exports = router;
