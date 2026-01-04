import { createClient, RedisClientType } from 'redis';
import { logMessage } from '../logger/logger';

const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || '6379'}`;

export const client: RedisClientType = createClient({ url: redisUrl });

client.on('error', (err: Error) => {
  logMessage(`Redis Client Error: ${err.message}`);
});

export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    if (!client.isOpen) await client.connect();
    logMessage('Redis connected');
  } catch (err: any) {
    logMessage(`Failed to connect to Redis: ${err.message}`);
    throw err;
  }
  return client;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (client.isOpen) await client.disconnect();
    logMessage('Redis disconnected');
  } catch (err: any) {
    logMessage(`Failed to disconnect Redis: ${err.message}`);
    // swallow error
  }
};

export default client;
