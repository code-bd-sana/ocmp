// import { createClient, RedisClientType } from 'redis';
// import config from '../../config/config';
// import { logMessage } from '../logger/logger';

// export let isRedisConnected = false;
// // Construct Redis URL from environment variables or use default
// let redisUrl = config.REDIS_URL;

// if (!redisUrl) {
//   const host = config.REDIS_HOST || '127.0.0.1';
//   const port = config.REDIS_PORT || '6379';

//   // URL-encode the password to handle special characters
//   const encodedPassword = config.REDIS_PASSWORD ? encodeURIComponent(config.REDIS_PASSWORD) : '';

//   // Format: redis://[:password]@host:port (only use password, not username)
//   if (config.REDIS_PASSWORD) {
//     redisUrl = `redis://:${encodedPassword}@${host}:${port}`;
//   } else {
//     redisUrl = `redis://${host}:${port}`;
//   }
// }

// const redisOptions: { url: string } = {
//   url: redisUrl,
// };

// // Create Redis client
// export const client: RedisClientType = createClient(redisOptions);

// // Handle Redis client errors
// client.on('error', (err: Error) => {
//   logMessage(`Redis Client Error: ${err.message}`);
// });

// // Connect to Redis server
// export const connectRedis = async (): Promise<RedisClientType> => {
//   try {
//     if (!client.isOpen) await client.connect();
//     logMessage('Redis connected');
//   } catch (err: any) {
//     logMessage(`Failed to connect to Redis: ${err.message}`);
//     throw err;
//   }
//   return client;
// };

// // Disconnect from Redis server
// export const disconnectRedis = async (): Promise<void> => {
//   try {
//     if (client.isOpen) await client.disconnect();
//     logMessage('Redis disconnected');
//   } catch (err: any) {
//     logMessage(`Failed to disconnect Redis: ${err.message}`);
//     // swallow error
//   }
// };

// export default client;

import { createClient, RedisClientType } from 'redis';
import config from '../../config/config';
import { logMessage } from '../logger/logger';

export let isRedisConnected = false;

// Prefer REDIS_URL (Coolify)
let redisUrl = config.REDIS_URL;

if (!redisUrl) {
  const host = config.REDIS_HOST || '127.0.0.1';
  const port = config.REDIS_PORT || '6379';
  const password = config.REDIS_PASSWORD ? encodeURIComponent(config.REDIS_PASSWORD) : '';

  if (password) {
    redisUrl = `redis://:${password}@${host}:${port}`;
  } else {
    redisUrl = `redis://${host}:${port}`;
  }
}

// 🔥 Important: TLS + timeout added
export const client: RedisClientType = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 10000, // prevent infinite hang
    ...(redisUrl.startsWith('rediss://')
      ? {
          tls: true as const,
          rejectUnauthorized: false,
        }
      : {}),
  },
});

// Error handler
client.on('error', (err: Error) => {
  isRedisConnected = false;
  logMessage(`❌ Redis Client Error: ${err.message}`);
});

// Connect Redis (NON-BLOCKING SAFE)
export const connectRedis = async (): Promise<void> => {
  try {
    if (!client.isOpen) {
      await client.connect();
      isRedisConnected = true;
      logMessage('✅ Redis connected');
    }
  } catch (err: any) {
    isRedisConnected = false;
    logMessage(`❌ Redis failed: ${err.message}`);
  }
};

// Disconnect Redis
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (client.isOpen) {
      await client.disconnect();
      isRedisConnected = false;
      logMessage('Redis disconnected');
    }
  } catch (err: any) {
    logMessage(`Failed to disconnect Redis: ${err.message}`);
  }
};

export default client;
