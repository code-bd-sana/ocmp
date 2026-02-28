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
router.use(isAuthorized());



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

router.post(
  '/create-as-tm',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateCreateAuditAndRecificationReportAsManager,
  createAuditAndRecificationReportAsManager
);

router.post(
  '/create-stand-alone',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateAuditAndRecificationReportAsStandAlone,
  createAuditAndRecificationReportAsStandAlone
);


router.patch(
  '/update-by-manager/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateAuditAndRecificationReportIdParamAsManager,
  validateUpdateAuditAndRecificationReport,
  updateAuditAndRecificationReport
);

router.patch(
  '/update-by-standalone/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateAuditAndRecificationReportIdParam,
  validateUpdateAuditAndRecificationReport,
  updateAuditAndRecificationReport
);


router.delete(
  '/delete-by-manager/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateAuditAndRecificationReportIdParamAsManager,
  deleteAuditAndRecificationReport
);

router.delete(
  '/delete-by-standalone/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateAuditAndRecificationReportIdParam,
  deleteAuditAndRecificationReport
);
module.exports = router;