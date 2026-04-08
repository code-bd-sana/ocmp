// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  getSuperAdminDashboard,
} from './dashboard.controller';

import isAuthorized from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';

// Initialize router
const router = Router();
router.use(isAuthorized());

router.get('/', authorizedRoles([UserRole.SUPER_ADMIN]), getSuperAdminDashboard);

// Export the router
module.exports = router;
