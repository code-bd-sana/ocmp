import express, { Application, Request, Response } from 'express';
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
import morgan from 'morgan';
import { loggerStream } from './utils/logger/logger';

// Express app initialization
const app: Application = express();

// Define the path to the public directory
const publicDirPath = path.join(__dirname, '..', 'public');

// Middleware setup
app.use(express.json({ limit: config.MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: config.URL_ENCODED }));
app.use(cookieParser());
app.use(fileUpload(config.EXPRESS_FILE_UPLOAD_CONFIG));

// Security middleware initialization
app.use(cors());
app.use(helmet());
app.use((req: any, res: any, next: any) => {
  const sanitizer = (mongoSanitize as any).sanitize || ((obj: any) => obj);
  ['body', 'params', 'headers', 'query'].forEach((key) => {
    if (req[key]) {
      const target = sanitizer(req[key]);
      try {
        req[key] = target;
      } catch (err) {
        if (typeof req[key] === 'object' && req[key] && typeof target === 'object' && target) {
          Object.keys(req[key]).forEach((k) => delete req[key][k]);
          Object.keys(target).forEach((k) => {
            req[key][k] = target[k];
          });
        }
      }
    }
  });
  next();
});
app.use(hpp());
app.use(morgan('dev'));

// Use Morgan with the custom logger
app.use(morgan('combined', { stream: loggerStream }));

// Request Rate Limiting
app.use(
  rateLimit({
    windowMs: config.REQUEST_LIMIT_TIME,
    max: config.NODE_ENV !== 'production' ? Infinity : config.REQUEST_LIMIT_NUMBER,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Serve static files from the public directory
app.use(
  express.static(publicDirPath, {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// Recursive function to load routes from nested folders
export const routes: { module: string; path: string; method: string; time: number }[] = [];

const loadRoutes = (basePath: string, baseRoute: string) => {
  if (fs.existsSync(basePath)) {
    fs.readdirSync(basePath).forEach((item: string) => {
      const itemPath = path.join(basePath, item);
      const routePrefix = `${baseRoute}/${item.replace('.route', '')}`;

      const start = performance.now();
      if (fs.statSync(itemPath).isDirectory()) {
        loadRoutes(itemPath, routePrefix);
      } else if (item.endsWith('.route.ts') || item.endsWith('.route.js')) {
        const routeModule = require(itemPath);
        app.use(baseRoute, routeModule);

        if (config.NODE_ENV !== 'production') {
          const end = performance.now();
          routeModule.stack.forEach((layer: any) => {
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
  }
};

// Load routes starting from the 'modules' directory
const routesPath = path.join(__dirname, 'modules');
loadRoutes(routesPath, '/api/v1');

// Serve an image file on the root route
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDirPath, 'images', 'index.png'), (err) => {
    if (err) {
      console.error(`Failed to send image file: ${err.message}`);
      res.status(500).send('Failed to send image.');
    }
  });
});

// Path not found handler
import PathNotFound from './helpers/responses/path-not-found';
app.use(PathNotFound);

export default app;
