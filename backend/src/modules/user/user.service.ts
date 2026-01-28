// Import the model

import User, { IUser as IUserPayload } from '../../models/users-accounts/user.schema';
import { getUserData, setUserData } from '../../utils/redis/user/user';
import { IUserResponse } from './user.interface';

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
  const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

  const updateUserData: Partial<IUserResponse> = {
    _id: updatedUser?._id.toString(),
    fullName: updatedUser?.fullName,
    email: updatedUser?.email,
    phone: updatedUser?.phone || '',
    role: updatedUser?.role,
    isEmailVerified: updatedUser?.isEmailVerified || false,
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

  const userProfile = await User.findById(id);

  const userProfileData: Partial<IUserResponse> = {
    _id: userProfile?._id.toString(),
    fullName: userProfile?.fullName,
    email: userProfile?.email,
    phone: userProfile?.phone || '',
    role: userProfile?.role,
    isEmailVerified: userProfile?.isEmailVerified || false,
  };

  // Store the user profile in Redis cache
  await setUserData(id, userProfileData as IUserResponse, 30 * 24 * 60 * 60); // Set TTL to 30 days

  return userProfileData;
};

export const userServices = {
  updateUser,
  getUserProfile,
};
