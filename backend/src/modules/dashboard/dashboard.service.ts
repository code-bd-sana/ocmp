import { User, Vehicle, UserRole, LoginActivity, IUser, ClientManagement } from '../../models';
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

export const dashboardServices = {
  getSuperAdminDashboard,
};

