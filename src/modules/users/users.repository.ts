import { BaseRepository, IBaseRepository } from '../../common/base.repository';
import { prisma } from '../../database/connection';
import { User } from '@prisma/client';

import { injectable } from 'tsyringe';

export interface IUserRepository extends IBaseRepository<User> {
    // Add specific methods here if needed
}

@injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
    constructor() {
        super(prisma.user);
    }
}
