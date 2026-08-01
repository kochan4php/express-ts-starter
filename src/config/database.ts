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

export default async function database(retries = 5): Promise<void> {
    while (retries > 0) {
        try {
            await prisma.$connect();
            logger.info('Database', 'PostgreSQL Connected via Prisma');
            return;
        } catch (error: any) {
            retries -= 1;
            logger.error('Database', `Connection failed. Retries left: ${retries}. Error: ${error.message}`);
            if (retries === 0) {
                process.exit(1);
            }
            await new Promise((res) => setTimeout(res, 2000));
        }
    }
}
