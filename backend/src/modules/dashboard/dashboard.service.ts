import {
  User,
  Vehicle,
  UserRole,
  LoginActivity,
  Driver,
  Planner,
  ClientManagement,
  ClientStatus,
} from '../../models';
import VehicleModel from '../../models/vehicle-transport/vehicle.schema';

const getSuperAdminDashboard = async () => {
  // Reusable filter — exclude SUPER_ADMIN
  const excludeSuperAdmin = { role: { $ne: UserRole.SUPER_ADMIN } };

  const [
    totalUsers,
    totalManagers,
    totalClients,
    totalVehicles,
    recentUsers,
    transportManagers,
    recentClients,
  ] = await Promise.all([
    // Summary counts
    User.countDocuments(excludeSuperAdmin),
    User.countDocuments({ role: UserRole.TRANSPORT_MANAGER }),
    User.countDocuments({ role: UserRole.STANDALONE_USER }),
    Vehicle.countDocuments(),

    // User Overview — last 5 users excluding SUPER_ADMIN
    User.find(excludeSuperAdmin)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName role email createdAt isActive')
      .lean(),

    // Transport Manager Overview — last 5
    User.find({ role: UserRole.TRANSPORT_MANAGER })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email createdAt isActive')
      .lean(),

    // Client Overview — last 5 standalone users
    User.find({ role: UserRole.STANDALONE_USER })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email createdAt isActive')
      .lean(),
  ]);

  // --- Assigned vehicle count for each Transport Manager ---
  // Logic: TM → ClientManagement → clients[] → Vehicle count per client → sum per TM

  // Step 1: get ClientManagement docs for these TMs
  const tmUserIds = transportManagers.map((u) => u._id);

  const clientManagementDocs = await ClientManagement.find({
    managerId: { $in: tmUserIds },
  })
    .select('managerId clients')
    .lean();

  // Step 2: collect all unique client ids across all TMs
  const allClientIds = clientManagementDocs.flatMap((doc) =>
    doc.clients.map((c: any) => c.clientId)
  );

  // Step 3: count vehicles per clientId in a single aggregate query
  const vehicleCounts = await VehicleModel.aggregate([
    { $match: { standAloneId: { $in: allClientIds } } },
    { $group: { _id: '$standAloneId', count: { $sum: 1 } } },
  ]);

  // Build Map — clientId → vehicle count, for O(1) lookup
  const vehiclePerClientMap = new Map<string, number>();
  for (const vc of vehicleCounts) {
    vehiclePerClientMap.set(vc._id.toString(), vc.count);
  }

  // Step 4: sum all clients' vehicle counts per TM
  const tmVehicleCountMap = new Map<string, number>();
  for (const doc of clientManagementDocs) {
    const total = doc.clients.reduce((sum: number, c: any) => {
      return sum + (vehiclePerClientMap.get(c.clientId.toString()) ?? 0);
    }, 0);
    tmVehicleCountMap.set(doc.managerId.toString(), total);
  }

  // --- Last login for non-TM users (recentUsers + recentClients) ---
  // TM does not have lastLogin column
  const nonTmUsers = [...recentUsers, ...recentClients];
  const emails = [...new Set(nonTmUsers.map((u) => u.email))];

  const lastLogins = await LoginActivity.find({
    email: { $in: emails },
    isSuccessful: true,
  })
    .sort({ loginAt: -1 })
    .select('email loginAt')
    .lean();

  // Build Map — first entry per email is latest due to sort
  const lastLoginMap = new Map<string, Date | undefined>();
  for (const activity of lastLogins) {
    if (!lastLoginMap.has(activity.email)) {
      lastLoginMap.set(activity.email, activity.loginAt);
    }
  }

  // Attach lastLogin to user and client lists
  const attachLastLogin = (users: any[]) =>
    users.map((user) => ({
      ...user,
      lastLogin: lastLoginMap.get(user.email) ?? null,
    }));

  // Attach assignedVehicle (sum of all clients' vehicles) to each TM
  const attachAssignedVehicle = (managers: any[]) =>
    managers.map((manager) => ({
      ...manager,
      assignedVehicle: tmVehicleCountMap.get(manager._id.toString()) ?? 0,
    }));

  return {
    summary: {
      totalUsers,
      totalManagers,
      totalClients,
      totalVehicles,
    },
    userOverview: attachLastLogin(recentUsers),
    transportManagerOverview: attachAssignedVehicle(transportManagers),
    clientOverview: attachLastLogin(recentClients),
  };
};

// For SUPER_ADMIN: global summary counts + recent users/clients/managers with last login and assigned vehicle count for TMs
const getDashboardSummary = async (userId: string, role: UserRole) => {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const monthFilter = {
    plannerDate: {
      $gte: startOfMonth,
      $lt: startOfNextMonth,
    },
  };

  // For SUPER_ADMIN, aggregate global counts.
  if (role === UserRole.SUPER_ADMIN) {
    const [totalClients, totalDrivers, totalVehicles, totalEvents] = await Promise.all([
      User.countDocuments({ role: UserRole.STANDALONE_USER }),
      Driver.countDocuments(),
      Vehicle.countDocuments(),
      Planner.countDocuments(monthFilter),
    ]);

    return {
      totalClients,
      totalDrivers,
      totalVehicles,
      totalEvents,
    };
  }

  // For STANDALONE_USER, aggregate only their own data (vehicles/drivers they created or that are assigned to them). Events are those in the current month that they created or are assigned to.
  if (role === UserRole.STANDALONE_USER) {
    const ownFilter = {
      $or: [{ standAloneId: userId }, { createdBy: userId }],
    };

    const [totalDrivers, totalVehicles, totalEvents, clientManagementDoc] = await Promise.all([
      Driver.countDocuments(ownFilter),
      Vehicle.countDocuments(ownFilter),
      Planner.countDocuments({ ...monthFilter, ...ownFilter }),
      ClientManagement.findOne({
        'clients.clientId': userId,
        'clients.status': ClientStatus.APPROVED,
      })
        .populate('managerId', 'fullName email')
        .lean(),
    ]);

    return {
      totalClients: 0,
      totalDrivers,
      totalVehicles,
      totalEvents,
      transportManagerName: (clientManagementDoc?.managerId as any)?.fullName || 'None',
      transportManagerEmail: (clientManagementDoc?.managerId as any)?.email || 'None',
    };
  }

  // Transport Manager: aggregate across all non-revoked clients in their team
  const managerDoc = await ClientManagement.findOne({ managerId: userId }).select('clients').lean();

  const clientIds = (managerDoc?.clients || [])
    .filter((entry: any) => entry.status !== ClientStatus.REVOKED)
    .map((entry: any) => entry.clientId);

  if (!clientIds.length) {
    return {
      totalClients: 0,
      totalDrivers: 0,
      totalVehicles: 0,
      totalEvents: 0,
    };
  }

  const teamFilter = {
    $or: [{ standAloneId: { $in: clientIds } }, { createdBy: { $in: clientIds } }],
  };

  const [totalDrivers, totalVehicles, totalEvents] = await Promise.all([
    Driver.countDocuments(teamFilter),
    Vehicle.countDocuments(teamFilter),
    Planner.countDocuments({ ...monthFilter, ...teamFilter }),
  ]);

  return {
    totalClients: clientIds.length,
    totalDrivers,
    totalVehicles,
    totalEvents,
  };
};

export const dashboardServices = {
  getSuperAdminDashboard,
  getDashboardSummary,
};
