import { User, Vehicle, UserRole, LoginActivity, IUser } from '../../models';

const getSuperAdminDashboard = async () => {
  // ✅ Reusable filter — SUPER_ADMIN exclude
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
    // --- Summary counts ---
    User.countDocuments(excludeSuperAdmin),
    User.countDocuments({ role: UserRole.TRANSPORT_MANAGER }),
    User.countDocuments({ role: UserRole.STANDALONE_USER }),
    Vehicle.countDocuments(),

    // --- User Overview table (last 5 users) ---
    User.find(excludeSuperAdmin)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name role email createdAt isActive')
      .lean(),

    // Transport Manager Overview
    User.find({ role: UserRole.TRANSPORT_MANAGER })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt isActive')
      .lean(),

    // Client Overview
    User.find({ role: UserRole.STANDALONE_USER })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt isActive')
      .lean(),
  ]);

  const allUsers = [...recentUsers, ...transportManagers, ...recentClients];
  const emails = [...new Set(allUsers.map((u) => u.email))];

  const lastLogins = await LoginActivity.find({
    email: { $in: emails },
    isSuccessful: true,
  })
    .sort({ loginAt: -1 })
    .select('email loginAt')
    .lean();

  const lastLoginMap = new Map<string, Date | undefined>();
  for (const activity of lastLogins) {
    if (!lastLoginMap.has(activity.email)) {
      lastLoginMap.set(activity.email, activity.loginAt);
    }
  }

  const attachLastLogin = (users: IUser[]) =>
    users.map((user) => ({
      ...user,
      lastLogin: lastLoginMap.get(user.email) ?? null,
    }));

  return {
    summary: {
      totalUsers,
      totalManagers,
      totalClients,
      totalVehicles,
    },
    userOverview: attachLastLogin(recentUsers),
    transportManagerOverview: attachLastLogin(transportManagers),
    clientOverview: attachLastLogin(recentClients),
  };
};

export const dashboardServices = {
  getSuperAdminDashboard,
};
