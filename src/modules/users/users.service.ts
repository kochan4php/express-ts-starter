import { IUserRepository } from './users.repository';

export class UserService {
    constructor(private readonly userRepository: IUserRepository) {}

    public async getAllUsers(filter: any = {}): Promise<any[]> {
        return await this.userRepository.findAll(filter, { select: { id: true, name: true, phoneNumber: true, email: true, avatar: true, bio: true, role: true } });
    }

    public async getOneUser(filter: any, select: any = {}, throwError: boolean = false): Promise<any | null> {
        const user = await this.userRepository.findOne(filter);
        return user;
    }

    public async getOneUserById(id: string): Promise<any | null> {
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

    public async updateOneUserById(id: string, data: any): Promise<any> {
        return await this.userRepository.update(id, data);
    }

    public async deleteOneUserById(id: string): Promise<any> {
        return await this.userRepository.delete(id);
    }
}
