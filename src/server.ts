/**
 * @description This file is the entry point of the application
 * @description It contains the Bootstrap class to start the server
 * @author {Deo Sbrn}
 */

import 'reflect-metadata';
import { Server, Socket } from 'socket.io';
import socketController from './modules/core/socket.controller';
import { socketConfig } from './config/app';
import { PORT } from './config/env';
import { logger } from './common/utils/logger';
import { HealthChecker } from './health/health.checker';
import database, { prisma } from './database/connection';
import { App } from './app';
import { container } from './container';
import { injectable, inject } from 'tsyringe';

@injectable()
export class Bootstrap {
    constructor(@inject(App) private readonly app: App) {}

    public async start(): Promise<void> {
        try {
            // 1. Establish database connection
            await database();

            // 2. Start periodic health check
            HealthChecker.start();

            // 3. Start HTTP listener
            const server = this.app.instance.listen(PORT, () => {
                logger.info('Server', `started on port ${PORT}`);
            });

            // 4. Start Socket.IO
            const io = new Server(server, socketConfig());
            io.on('connection', (socket: Socket) => socketController(socket, io));

            // 5. Handle graceful shutdown
            this.handleGracefulShutdown(server);
        } catch (error: any) {
            logger.error('Bootstrap', `Failed to start server: ${error.message}`);
            process.exit(1);
        }
    }

    private handleGracefulShutdown(server: any): void {
        const shutdown = async (signal: string) => {
            logger.info('Server', `Received ${signal}. Shutting down gracefully...`);
            HealthChecker.stop();
            
            server.close(async () => {
                logger.info('Server', 'Closed HTTP server');
                try {
                    await prisma.$disconnect();
                    logger.info('Database', 'Closed database connection');
                    process.exit(0);
                } catch (error: any) {
                    logger.error('Database', `Error during disconnection: ${error.message}`);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}

// Instantiate and start the application
container.resolve(Bootstrap).start();
