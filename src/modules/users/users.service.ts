import { injectable, inject } from 'tsyringe';
import { IUserRepository } from './users.repository';
import { ForbiddenError } from '../../common/errors/AppError';

import { Gate } from '../../common/authorization/gate';
import { Abilities } from '../../common/authorization/abilities';

@injectable()
export class UserService {
    constructor(
        @inject('IUserRepository') private readonly userRepository: IUserRepository,
        @inject(Gate) private readonly gate: Gate
    ) {}

    public async getAllUsers(currentUser: any, filter: any = {}, limit: number = 10, offset: number = 0): Promise<any[]> {
        this.gate.authorize(Abilities.READ_ALL_USERS, currentUser);
        return await this.userRepository.findAll(filter, { select: { id: true, name: true, phoneNumber: true, email: true, avatar: true, bio: true, role: true }, take: limit, skip: offset });
    }

    public async getOneUser(filter: any, select: any = {}, throwError: boolean = false): Promise<any | null> {
        const user = await this.userRepository.findOne(filter);
        return user;
    }

    public async getOneUserById(currentUser: any, id: string): Promise<any | null> {
        this.gate.authorize(Abilities.READ_USER, currentUser, id);
        const user = await this.userRepository.findById(id);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    public async createUser(data: any): Promise<any> {
        return await this.userRepository.create(data);
    }

    public async updateOneUserById(currentUser: any, id: string, data: any): Promise<any> {
        this.gate.authorize(Abilities.UPDATE_USER, currentUser, id);
        return await this.userRepository.update(id, data);
    }

    public async deleteOneUserById(currentUser: any, id: string): Promise<any> {
        this.gate.authorize(Abilities.DELETE_USER, currentUser, id);
        return await this.userRepository.delete(id);
    }
}
