// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { getSuperAdminDashboard, getDashboardSummary } from './dashboard.controller';

import isAuthorized from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';

// Initialize router
const router = Router();
router.use(isAuthorized());

router.get('/', authorizedRoles([UserRole.SUPER_ADMIN]), getSuperAdminDashboard);
router.get(
  '/summary',
  authorizedRoles([UserRole.SUPER_ADMIN, UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  getDashboardSummary
);

// Export the router
module.exports = router;
