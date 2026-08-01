/**
 * @description This file contain database configuration using Prisma
 * @author {Deo Sbrn}
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '../logger';
import { DATABASE_URL } from './env';

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export default async function database(): Promise<void> {
    try {
        await prisma.$connect();
        logger.info('Database', 'PostgreSQL Connected via Prisma');
    } catch (error: any) {
        logger.error('Database', error.message);
        process.exit(1);
    }
}
