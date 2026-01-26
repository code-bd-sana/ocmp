import client, { connectRedis, disconnectRedis } from '../redis-client';

export const connect = async () => connectRedis();
export const disconnect = async () => disconnectRedis();

/**
 * To set a user data using user id as key in Redis with optional TTL (in seconds)
 *
 * @param {string} userId - The user ID to set the data for.
 * @param {any} value - The data value to store.
 * @param {('keyClock' | 'DB')} [incomingDataType] - The type of data being stored.
 * @param {number} [ttlSeconds] - Optional time-to-live in seconds.
 * @returns {Promise<string | null>} - Result of the set operation.
 */
export const setUserData = async (
  userId: string,
  value: any,
  incomingDataType?: 'keyClock' | 'DB',
  ttlSeconds?: number
): Promise<string | null> => {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    return client.set(`${userId}-${incomingDataType}`, v, { EX: ttlSeconds });
  }
  return client.set(`${userId}-${incomingDataType}`, v);
};

/**
 * To get a user data from Redis
 *
 * @param {string} userId - The user ID to get the data for.
 * @param {('keyClock' | 'DB')} [incomingDataType] - The type of data being retrieved.
 * @returns {Promise<T | null>} - The retrieved data or null if not found.
 */
export const getUserData = async <T = any>(
  userId: string,
  incomingDataType?: 'keyClock' | 'DB'
): Promise<T | null> => {
  const val = await client.get(`${userId}-${incomingDataType}`);
  if (val === null) return null;
  try {
    return JSON.parse(val) as T;
  } catch (_err) {
    return val as unknown as T;
  }
};

/**
 * To delete a user data from Redis
 *
 * @param {string} userId - The user ID to delete the data for.
 * @param {('keyClock' | 'DB')} [incomingDataType] - The type of data being deleted.
 * @returns {Promise<number>} - Number of keys that were removed.
 */
export const delUserData = async (
  userId: string,
  incomingDataType?: 'keyClock' | 'DB'
): Promise<number> => client.del(`${userId}-${incomingDataType}`);

/**
 * To check if a user data exists in Redis
 *
 * @param {string} userId - The user ID to check the data for.
 * @param {('keyClock' | 'DB')} [incomingDataType] - The type of data being checked.
 * @returns {Promise<number>} - 1 if the key exists, 0 if it does not.
 */
export const existsUserData = async (
  userId: string,
  incomingDataType?: 'keyClock' | 'DB'
): Promise<number> => client.exists(`${userId}-${incomingDataType}`);

/**
 * To set expiration for a user data in Redis
 *
 * @param {string} userId - The user ID to set expiration for.
 * @param {number} seconds - Expiration time in seconds.
 * @param {('keyClock' | 'DB')} [incomingDataType] - The type of data for which expiration is being set.
 * @returns {Promise<number>} - 1 if the timeout was set, 0 if the key does not exist.
 */
export const expireUserData = async (
  userId: string,
  seconds: number,
  incomingDataType?: 'keyClock' | 'DB'
): Promise<number> => client.expire(`${userId}-${incomingDataType}`, seconds);

// Export all functions as default
export default {
  setUserData,
  getUserData,
  delUserData,
  existsUserData,
  expireUserData,
};
