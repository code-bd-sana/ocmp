import { IUserResponse } from '../../../modules/user/user.interface';
import client, { connectRedis, disconnectRedis } from '../redis-client';

export const connect = async () => connectRedis();
export const disconnect = async () => disconnectRedis();

/**
 * To set a user data using user id as key in Redis with optional TTL (in seconds)
 *
 * @param {string} key - The user ID to set the data for.
 * @param {any} value - The data value to store.
 * @param {number} [ttlSeconds] - Optional time-to-live in seconds.
 * @returns {Promise<string | null>} - Result of the set operation.
 */
export const setUserData = async (
  key: string,
  value: IUserResponse,
  ttlSeconds?: number
): Promise<string | null> => {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    return client.set(key, v, { EX: ttlSeconds });
  }
  return client.set(key, v);
};

/**
 * To get a user data from Redis
 *
 * @param {string} key - The user ID to get the data for.
 * @returns {Promise<IUserResponse | null>} - The retrieved data or null if not found.
 */
export const getUserData = async <T = any>(key: string): Promise<IUserResponse | null> => {
  const val = await client.get(key);
  if (val === null) return null;
  try {
    return JSON.parse(val) as IUserResponse;
  } catch (_err) {
    return val as unknown as IUserResponse;
  }
};

/**
 * To delete a user data from Redis
 *
 * @param {string} key - The user ID to delete the data for.
 * @returns {Promise<number>} - Number of keys that were removed.
 */
export const delUserData = async (key: string): Promise<number> => client.del(key);

/**
 * To check if a user data exists in Redis
 *
 * @param {string} key - The user ID to check the data for.
 * @returns {Promise<number>} - 1 if the key exists, 0 if it does not.
 */
export const existsUserData = async (key: string): Promise<number> => client.exists(key);

/**
 * To set expiration for a user data in Redis
 *
 * @param {string} key - The user ID to set expiration for.
 * @param {number} seconds - Expiration time in seconds.
 * @returns {Promise<number>} - 1 if the timeout was set, 0 if the key does not exist.
 */
export const expireUserData = async (key: string, seconds: number): Promise<number> =>
  client.expire(key, seconds);

// Export all functions as default
export default {
  setUserData,
  getUserData,
  delUserData,
  existsUserData,
  expireUserData,
};
