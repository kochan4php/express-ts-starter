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
import { apiReference } from '@scalar/express-api-reference';
import SwaggerParser from '@apidevtools/swagger-parser';
import { resFailed } from './app/helpers/response.helper';
import auth from './app/middlewares/auth.middleware';
import isAdmin from './app/middlewares/is-admin.middleware';
import { corsConfig, limitterConfig } from './config/app';
import database from './config/database';
import userRoute from './routes/admin/user.route';
import authRoute from './routes/auth.route';
import healthCheckRoute from './routes/health-check.route';
import mainRoute from './routes/main.route';

/**
 * @description Init express application
 * @returns {Application} - Express application
 */
const init = async function (): Promise<Application> {
    // * Init express app
    const app: Application = express();

    // * Connect to database
    await database();

    // * Middlewares
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
            })(req, res, next);
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

    // * Return express app
    return app;
};

export default init;
