import client, { connectRedis, disconnectRedis } from '../redis-client';
export const connect = async () => connectRedis();
export const disconnect = async () => disconnectRedis();

/**
 * To set a user access token in Redis with optional TTL (in seconds)
 *
 * @param {string} userId - The user ID to set the token for.
 * @param {any} value - The token value to store.
 * @param {number} [ttlSeconds] - Optional time-to-live in seconds.
 * @returns {Promise<string | null>} - Result of the set operation.
 */
export const setUserToken = async (
  userId: string,
  value: any,
  ttlSeconds?: number
): Promise<string | null> => {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    return client.set(userId, v, { EX: ttlSeconds });
  }
  return client.set(userId, v);
};

/**
 * To get a user access token from Redis
 *
 * @param {string} userId - The user ID to get the token for.
 * @returns {Promise<T | null>} - The retrieved token or null if not found.
 */
export const getUserToken = async <T = any>(userId: string): Promise<T | null> => {
  const val = await client.get(userId);
  if (val === null) return null;
  try {
    return JSON.parse(val) as T;
  } catch (_err) {
    return val as unknown as T;
  }
};

/**
 * To delete a user access token from Redis
 *
 * @param {string} userId - The user ID to delete the token for.
 * @returns {Promise<number>} - Number of keys that were removed.
 */
export const delUserToken = async (userId: string): Promise<number> => client.del(userId);

/**
 * To check if a user access token exists in Redis
 *
 * @param {string} userId - The user ID to check the token for.
 * @returns {Promise<number>} - 1 if the key exists, 0 if it does not.
 */
export const existsUserToken = async (userId: string): Promise<number> => client.exists(userId);

/**
 * To set expiration for a user access token in Redis
 *
 * @param {string} userId - The user ID to set expiration for.
 * @param {number} seconds - Expiration time in seconds.
 * @returns {Promise<number>} - 1 if the timeout was set, 0 if the key does not exist.
 */
export const expireUserToken = async (userId: string, seconds: number): Promise<number> =>
  client.expire(userId, seconds);

// Export all functions as default
export default {
  setUserToken,
  getUserToken,
  delUserToken,
  existsUserToken,
  expireUserToken,
};
