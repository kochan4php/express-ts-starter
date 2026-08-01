/**
 * @description This file contain all routes for health check endpoints
 * @author {Deo Sbrn}
 */

import { Request, Response } from 'express';
import { resFailed, resSuccess } from '../helpers';
import { logger } from '../../logger';
import { prisma } from '../../config/database';

/**
 * @description This function will check health of the application
 * @param {Request} _ - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Response} - Express Response
 */
function healthCheck(_: Request, res: Response): Response {
    const health = {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: Date.now(),
    };
    return resSuccess(res, 200, 'Health check success', health);
}

/**
 * @description This function will check database health dynamically upon request.
 * K8s will hit this periodically.
 * @param {Request} _ - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function dbHealthCheck(_: Request, res: Response): Promise<Response> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return resSuccess(res, 200, 'Database is healthy', { dbHealthy: true, timestamp: Date.now() });
    } catch (error: any) {
        logger.error('DatabaseHealthCheck', `Health check failed: ${error.message}`);
        // Prisma automatically handles reconnection pooling for subsequent queries,
        // but if it fails continuously, K8s will eventually restart the Pod.
        return resFailed(res, 503, 'Database is unhealthy', { dbHealthy: false, timestamp: Date.now() });
    }
}

export default { healthCheck, dbHealthCheck };
