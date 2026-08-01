/**
 * @description This file contain database configuration using Prisma
 * @author {Deo Sbrn}
 */
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

export const prisma = new PrismaClient();

export default async function database(): Promise<void> {
    try {
        await prisma.$connect();
        logger.info('Database', 'PostgreSQL Connected via Prisma');
    } catch (error: any) {
        logger.error('Database', error.message);
        process.exit(1);
    }
}
