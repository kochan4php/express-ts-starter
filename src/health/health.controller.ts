import { Request, Response } from 'express';
import { resFailed, resSuccess } from '../common/response';
import { Logger } from '../common/utils/logger';
import { prisma } from '../database/connection';

export class HealthController {
    public async healthCheck(_: Request, res: Response): Promise<Response> {
        const health = {
            status: 'UP',
            uptime: process.uptime(),
            timestamp: Date.now(),
        };
        return resSuccess(res, 200, 'Health check success', health);
    }

    public async dbHealthCheck(_: Request, res: Response): Promise<Response> {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return resSuccess(res, 200, 'Database is healthy', { dbHealthy: true, timestamp: Date.now() });
        } catch (error: any) {
            Logger.error('DatabaseHealthCheck', `Health check failed: ${error.message}`);
            return resFailed(res, 503, 'Database is unhealthy', { dbHealthy: false, timestamp: Date.now() });
        }
    }
}
