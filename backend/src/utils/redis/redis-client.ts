import { createClient, RedisClientType } from 'redis';
import config from '../../config/config';
import { logMessage } from '../logger/logger';

// Construct Redis URL from environment variables or use default
let redisUrl = config.REDIS_URL;

if (!redisUrl) {
  const host = config.REDIS_HOST || '127.0.0.1';
  const port = config.REDIS_PORT || '6379';
  const username = config.REDIS_USERNAME ? `${config.REDIS_USERNAME}` : 'default';
  const password = config.REDIS_PASSWORD ? `:${config.REDIS_PASSWORD}` : '';

  // Include auth credentials in URL if password is provided
  if (config.REDIS_PASSWORD) {
    redisUrl = `redis://${username}${password}@${host}:${port}`;
  } else {
    redisUrl = `redis://${host}:${port}`;
  }
}

const redisOptions: { url: string } = {
  url: redisUrl,
};

// Create Redis client
export const client: RedisClientType = createClient(redisOptions);

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
