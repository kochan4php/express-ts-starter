/**
 * @description This file contain a method to init express application
 * @description It will connect to database PostgreSQL and use all middlewares
 * @description It also contain all routes for all endpoints
 * @author {Deo Sbrn}
 */

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import { rateLimit } from 'express-rate-limit';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import { apiReference } from '@scalar/express-api-reference';
import SwaggerParser from '@apidevtools/swagger-parser';
import { resFailed } from './common/response';
import auth from './common/middlewares/auth.middleware';
import isAdmin from './common/middlewares/is-admin.middleware';
import { errorHandler } from './common/middlewares/error.middleware';
import { corsConfig, limitterConfig } from './config/app';
import database from './database/connection';
import userRoute from './modules/users/users.route';
import authRoute from './modules/auth/auth.route';
import healthCheckRoute from './health/health.route';
import mainRoute from './modules/core/core.route';

/**
 * @description Init express application
 * @returns {Application} - Express application
 */
const init = function (): Application {
    // * Init express app
    const app: Application = express();

    // * Connect to database
    database();

    // * Middlewares
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net", "https://fonts.scalar.com"],
                fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "https://fonts.scalar.com"],
                imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
            },
        },
    }));
    app.disable('x-powered-by');
    app.use(cors(corsConfig()));
    app.use(rateLimit(limitterConfig()));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));

    // * API Documentation (Scalar)
    const openapiPath = path.resolve(process.cwd(), 'openapi/openapi.yaml');
    if (fs.existsSync(openapiPath)) {
        let bundledSpec: any = null;
        SwaggerParser.bundle(openapiPath)
            .then((spec) => {
                bundledSpec = spec;
            })
            .catch((err) => console.error('Failed to bundle openapi:', err));

        app.use('/docs', (req, res, next) => {
            if (!bundledSpec) {
                return res.status(503).send('API Documentation is still loading...');
            }
            apiReference({
                theme: 'purple',
                spec: {
                    content: bundledSpec,
                },
            })(req as any, res as any, next);
        });
    }

    // * Main Route
    app.use('/api', mainRoute);

    // * Health Check Route
    app.use('/api/health-check', healthCheckRoute);

    // * Auth Route
    app.use('/api/auth', authRoute);

    // * Admin Route
    app.use('/api/admin/users', auth, isAdmin, userRoute);

    // * 404 Not Found
    app.use((_, res) => resFailed(res, 404, 'Path Not Found. Please go to /api'));

    // * Global Error Handler
    app.use(errorHandler);

    // * Return express app
    return app;
};

export default init;
