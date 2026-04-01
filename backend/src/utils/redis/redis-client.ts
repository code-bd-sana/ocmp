import { createClient, RedisClientType } from 'redis';
import config from '../../config/config';
import { logMessage } from '../logger/logger';

// ✅ Only use REDIS_URL (no localhost fallback)
const redisUrl = config.REDIS_URL as string;

if (!redisUrl) {
  throw new Error('REDIS_URL is not defined in environment variables');
}

// Create Redis client
export const client: RedisClientType = createClient({
  url: redisUrl,
});

// Handle Redis client errors
client.on('error', (err: Error) => {
  logMessage(`Redis Client Error: ${err.message}`);
});

// Connect to Redis server
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

// Disconnect from Redis server
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (client.isOpen) await client.disconnect();
    logMessage('Redis disconnected');
  } catch (err: any) {
    logMessage(`Failed to disconnect Redis: ${err.message}`);
  }
};

export default client;