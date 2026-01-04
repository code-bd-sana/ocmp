import client, { connectRedis, disconnectRedis } from './redis-client';

export const connect = async () => connectRedis();
export const disconnect = async () => disconnectRedis();

export const setKey = async (
  key: string,
  value: string | object,
  ttlSeconds?: number
): Promise<string | null> => {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    return client.set(key, v, { EX: ttlSeconds });
  }
  return client.set(key, v);
};

export const getKey = async <T = string | object>(key: string): Promise<T | null> => {
  const val = await client.get(key);
  if (val === null) return null;
  try {
    return JSON.parse(val) as T;
  } catch (_err) {
    return val as unknown as T;
  }
};

export const delKey = async (key: string): Promise<number> => client.del(key);

export const existsKey = async (key: string): Promise<number> => client.exists(key);

export const expireKey = async (key: string, seconds: number): Promise<number> =>
  client.expire(key, seconds);

export default {
  connect,
  disconnect,
  setKey,
  getKey,
  delKey,
  existsKey,
  expireKey,
};
