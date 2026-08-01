import { BaseRepository, IBaseRepository } from '../../common/base.repository';
import { prisma } from '../../database/connection';
import { Session } from '@prisma/client';

import { injectable } from 'tsyringe';

export interface ISessionRepository extends IBaseRepository<Session> {
    // Add specific methods here if needed
}

@injectable()
export class SessionRepository extends BaseRepository<Session> implements ISessionRepository {
    constructor() {
        super(prisma.session);
    }
}
