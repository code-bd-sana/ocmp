import { createClient, RedisClientType } from 'redis';
import { logMessage } from '../logger/logger';

// Construct Redis URL from environment variables or use default
const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || '6379'}`;

// Create Redis client
export const client: RedisClientType = createClient({ url: redisUrl });

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
    // swallow error
  }
};

export default client;
