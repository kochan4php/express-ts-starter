import { BaseRepository, IBaseRepository } from '../../common/base.repository';
import { prisma } from '../../database/connection';
import { Session } from '@prisma/client';

export interface ISessionRepository extends IBaseRepository<Session> {
    // Add specific methods here if needed
}

export class SessionRepository extends BaseRepository<Session> implements ISessionRepository {
    constructor() {
        super(prisma.session);
    }
}

export const sessionRepository = new SessionRepository();
