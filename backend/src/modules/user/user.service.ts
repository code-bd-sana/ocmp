// Import the model

import {
  ClientManagement,
  IUser as IUserPayload,
  LoginActivity,
  User,
  UserRole,
} from '../../models';
import { getUserData, setUserData } from '../../utils/redis/user/user';
import { GetAllUsersQueryInput, IUserResponse } from './user.interface';
import VehicleModel from '../../models/vehicle-transport/vehicle.schema';

/**
 * Service function to update a single user by ID.
 *
 * @param {string} id - The ID of the user to update.
 * @param {Partial<IUserPayload>} data - The updated data for the user.
 * @returns {Promise<Partial<IUserResponse>>} - The updated user.
 */
const updateUser = async (
  id: string,
  data: Partial<IUserPayload>
): Promise<Partial<IUserResponse | null>> => {
  // Update the user in the database
  const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
  // If the user was not found or update failed, return null
  const updateUserData: Partial<IUserResponse & { showInStandaloneUsersList?: boolean }> = {
    _id: updatedUser?._id.toString(),
    fullName: updatedUser?.fullName,
    email: updatedUser?.email,
    phone: updatedUser?.phone || '',
    role: updatedUser?.role,
    isEmailVerified: updatedUser?.isEmailVerified || false,
    showInStandaloneUsersList: updatedUser?.showInStandaloneUsersList,
  };
  // Update the user data in Redis cache
  if (updateUserData._id) {
    await setUserData(id, updateUserData as IUserResponse, 30 * 24 * 60 * 60); // Set TTL to 30 days
  }
  return updateUserData;
};

/**
 * Service function to get user profile by ID.
 *
 * @param {string} id - The ID of the user.
 * @returns {Promise<Partial<IUserResponse | null>>} - The user profile.
 */
const getUserProfile = async (id: string): Promise<Partial<IUserResponse | null>> => {
  // Try to get the user profile from Redis cache first
  const cacheUserProfileData = await getUserData<Partial<IUserResponse>>(id);
  if (cacheUserProfileData) {
    return cacheUserProfileData;
  }
  // If not found in cache, fetch from the database
  const userProfile = await User.findById(id);
  // If the user was not found, return null
  const userProfileData: Partial<IUserResponse & { showInStandaloneUsersList?: boolean }> = {
    _id: userProfile?._id.toString(),
    fullName: userProfile?.fullName,
    email: userProfile?.email,
    phone: userProfile?.phone || '',
    role: userProfile?.role,
    isEmailVerified: userProfile?.isEmailVerified || false,
    showInStandaloneUsersList: userProfile?.showInStandaloneUsersList,
  };

  // Store the user profile in Redis cache
  await setUserData(id, userProfileData as IUserResponse, 30 * 24 * 60 * 60); // Set TTL to 30 days
  return userProfileData;
};

const getAllUsers = async (query: GetAllUsersQueryInput) => {
  const { role, searchKey = '', showPerPage = 10, pageNo = 1 } = query;

  const limitPerPage = Math.min(Number(showPerPage), 100);
  const currentPage = Math.max(Number(pageNo), 1);

  const validRoles = ['all', 'transport-manager', 'standalone', undefined];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role param. Use 'all', 'transport-manager' or 'standalone'`);
  }

  // 'all' & undefined — return all users without SUPER_ADMIN
  const roleMap: Record<string, string> = {
    'transport-manager': UserRole.TRANSPORT_MANAGER,
    standalone: UserRole.STANDALONE_USER,
  };

  const isAllUsers = !role || role === 'all';
  const roleFilter = isAllUsers ? { role: { $ne: UserRole.SUPER_ADMIN } } : { role: roleMap[role] };

  // ─── Search filter ───────────────────────────────────────────────
  const andConditions: any[] = [roleFilter];

  if (searchKey) {
    andConditions.push({
      $or: [
        { fullName: { $regex: searchKey, $options: 'i' } },
        { email: { $regex: searchKey, $options: 'i' } },
      ],
    });
  }

  const finalFilter = { $and: andConditions };

  // ─── Pagination ──────────────────────────────────────────────────
  const skipItems = (currentPage - 1) * limitPerPage;
  const totalData = await User.countDocuments(finalFilter);
  const totalPages = Math.ceil(totalData / limitPerPage);

  const users = await User.find(finalFilter)
    .sort({ createdAt: -1 })
    .skip(skipItems)
    .limit(limitPerPage)
    .select('fullName email role isActive createdAt')
    .lean();

  // ─── AssignedVehicle count (Transport Manager only) ──────────────
  // There can be transport manager in role=all, so we are taking the id of all TMs.
  // const isTransportManagerOnly = role === 'transport-manager';
  const isAllRole = isAllUsers;

  // --- Assigned vehicle count for each Transport Manager ---
  const vehicleCountMap = new Map<string, number>();

  if (isAllUsers || role === 'transport-manager') {
    const tmUserIds = users
      ?.filter((u) => u?.role === UserRole.TRANSPORT_MANAGER)
      ?.map((u) => u?._id);

    if (tmUserIds?.length > 0) {
      // Step 1: get ClientManagement docs for these TMs
      const clientManagementDocs = await ClientManagement.find({
        managerId: { $in: tmUserIds },
      })
        .select('managerId clients')
        .lean();

      // Step 2: collect all unique client ids across all TMs
      const allClientIds = clientManagementDocs.flatMap((doc) =>
        doc?.clients?.map((c: any) => c?.clientId)
      );

      // Step 3: count vehicles per clientId using aggregate
      const vehicleCounts = await VehicleModel.aggregate([
        { $match: { standAloneId: { $in: allClientIds } } },
        { $group: { _id: '$standAloneId', count: { $sum: 1 } } },
      ]);

      // Build Map — clientId → vehicle count
      const vehiclePerClientMap = new Map<string, number>();
      for (const vc of vehicleCounts) {
        vehiclePerClientMap.set(vc._id.toString(), vc.count);
      }

      // Step 4: sum vehicle counts per TM
      for (const doc of clientManagementDocs) {
        const total = doc.clients.reduce((sum: number, c: any) => {
          return sum + (vehiclePerClientMap.get(c.clientId.toString()) ?? 0);
        }, 0);
        vehicleCountMap.set(doc.managerId.toString(), total);
      }
    }
  }

  // ─── LastLogin (without Transport Manager) ──────────────────────────
  const needsLastLogin = isAllRole || role === 'standalone';

  let lastLoginMap = new Map<string, Date | undefined>();

  if (needsLastLogin) {
    const emails = users.filter((u) => u.role !== UserRole.TRANSPORT_MANAGER).map((u) => u.email);

    if (emails.length > 0) {
      const lastLogins = await LoginActivity.find({
        email: { $in: emails },
        isSuccessful: true,
      })
        .sort({ loginAt: -1 })
        .select('email loginAt')
        .lean();

      for (const activity of lastLogins) {
        if (!lastLoginMap.has(activity.email)) {
          lastLoginMap.set(activity.email, activity.loginAt);
        }
      }
    }
  }

  // ─── Final data shape ────────────────────────────────────────────
  const data = users.map((u) => {
    const isManager = u.role === UserRole.TRANSPORT_MANAGER;
    return {
      ...u,
      //if TM get assignedVehicle count
      ...(isManager && {
        assignedVehicle: vehicleCountMap.get(u._id.toString()) ?? 0,
      }),
      //if TM, lastLogin remove
      ...(!isManager && {
        lastLogin: lastLoginMap.get(u.email) ?? null,
      }),
    };
  });

  return {
    data,
    totalData,
    totalPages,
    currentPage,
  };
};

export const userServices = {
  updateUser,
  getUserProfile,
  getAllUsers,
};
