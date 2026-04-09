// ! Production  fahhh->

import express, { Application } from 'express';
import fs from 'fs';
import path from 'path';
import config from './config/config';

// Security and Middleware imports
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoose from 'mongoose';
import morgan from 'morgan';

import PathNotFound from './helpers/responses/path-not-found';
import { startCronJob } from './utils/cron-job/cron-job';
import { loggerStream } from './utils/logger/logger';
import { connectRedis } from './utils/redis/redis-client';
import { seedSuperAdmin } from './seeds/userSeeder';

// Terminal colors
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const WHITE = '\x1b[37m';
const RESET = '\x1b[0m';

// Express app initialization
const app: Application = express();

// Trust proxy (important for Coolify / reverse proxy)
app.set('trust proxy', 1);

// Public folder
const publicDirPath = path.join(__dirname, '..', 'public');

// ================= MIDDLEWARE =================

app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: config.MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: config.URL_ENCODED }));
app.use(cookieParser());
app.use(fileUpload(config.EXPRESS_FILE_UPLOAD_CONFIG));

// Security
// Configure CORS to allow the frontend client and localhost during development
const allowedOrigins = Array.from(
  new Set([
    config.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'https://ocmp.co.uk',
  ])
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests like curl/postman (no origin)
      if (!origin) return callback(null, true);
      // Allow localhost origins for local development
      if (origin.startsWith('http://localhost')) return callback(null, true);
      // Allow specified origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(helmet());

app.use((req: any, res: any, next: any) => {
  const sanitizer = (mongoSanitize as any).sanitize || ((obj: any) => obj);

  ['body', 'params', 'headers', 'query'].forEach((key) => {
    if (req[key]) {
      const target = sanitizer(req[key]);
      try {
        req[key] = target;
      } catch {
        if (typeof req[key] === 'object' && target) {
          Object.keys(req[key]).forEach((k) => delete req[key][k]);
          Object.assign(req[key], target);
        }
      }
    }
  });

  next();
});

app.use(hpp());
app.use(morgan('dev'));
app.use(morgan('combined', { stream: loggerStream }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: config.REQUEST_LIMIT_TIME,
    max: config.NODE_ENV !== 'production' ? Infinity : config.REQUEST_LIMIT_NUMBER,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Static files
app.use(
  express.static(publicDirPath, {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// ================= ROUTES LOADER =================

const routes: any[] = [];

const loadRoutes = (basePath: string, baseRoute: string) => {
  if (!fs.existsSync(basePath)) return;

  fs.readdirSync(basePath).forEach((item: string) => {
    const itemPath = path.join(basePath, item);
    const start = performance.now();

    if (fs.statSync(itemPath).isDirectory()) {
      loadRoutes(itemPath, `${baseRoute}/${item}`);
    } else if (item.endsWith('.route.ts') || item.endsWith('.route.js')) {
      const routeModule = require(itemPath);
      app.use(baseRoute, routeModule);

      if (config.NODE_ENV !== 'production') {
        const end = performance.now();

        routeModule.stack?.forEach((layer: any) => {
          if (layer.route) {
            Object.keys(layer.route.methods).forEach((method) => {
              routes.push({
                module: item.split('.')[0],
                path: `${baseRoute}${layer.route.path}`,
                method: method.toUpperCase(),
                time: end - start,
              });
            });
          }
        });
      }
    }
  });
};

// Load routes
const routesPath = path.join(__dirname, 'modules');
loadRoutes(routesPath, '/api/v1');

export default app;
