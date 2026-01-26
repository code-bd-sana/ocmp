import client, { connectRedis, disconnectRedis } from './redis-client';

export const connect = async () => connectRedis();
export const disconnect = async () => disconnectRedis();

// Basic Redis operations

// Set a key with optional TTL (in seconds)
export const setKey = async (
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<string | null> => {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    return client.set(key, v, { EX: ttlSeconds });
  }
  return client.set(key, v);
};

// Get a key and parse it as JSON if possible
export const getKey = async <T = any>(key: string): Promise<T | null> => {
  const val = await client.get(key);
  if (val === null) return null;
  try {
    return JSON.parse(val) as T;
  } catch (_err) {
    return val as unknown as T;
  }
};

// Delete a key
export const delKey = async (key: string): Promise<number> => client.del(key);

// Check if a key exists
export const existsKey = async (key: string): Promise<number> => client.exists(key);

// Set expiration for a key
export const expireKey = async (key: string, seconds: number): Promise<number> =>
  client.expire(key, seconds);

// Export all functions as default
export default {
  connect,
  disconnect,
  setKey,
  getKey,
  delKey,
  existsKey,
  expireKey,
};
