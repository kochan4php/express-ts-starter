import { Request, Response } from 'express';
import { logger } from '../../common/utils/logger';
import { HashHelper } from '../../common/utils/hash.helper';
import { resFailed, resSuccess } from '../../common/response';
import { UserService } from './users.service';

export class UserController {
    constructor(private readonly userService: UserService) {}

    public async getAllUsers(_: Request, res: Response): Promise<Response> {
        try {
            const users = await this.userService.getAllUsers();

            if (!users.length) {
                const message: string = 'Users empty';
                return resFailed(res, 200, message);
            }

            const message: string = 'Success get all users';
            return resSuccess(res, 200, message, { users });
        } catch (error: any) {
            logger.error('UserController.getAllUsers', error.message);
            return resFailed(res, 500, error.message);
        }
    }

    public async getUserById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const user = await this.userService.getOneUserById(id as string);

            if (!user) {
                const message: string = 'User not found';
                return resFailed(res, 404, message);
            }

            const message: string = 'Success get user by id';
            return resSuccess(res, 200, message, { user });
        } catch (error: any) {
            logger.error('UserController.getUserById', error.message);
            return resFailed(res, 500, error.message);
        }
    }

    public async createUser(req: Request, res: Response): Promise<Response> {
        try {
            const { name, phoneNumber, email, password } = req.body;
            const existsUser = await this.userService.getOneUser({ OR: [{ phoneNumber }, { email }] });

            if (existsUser) {
                const message: string = 'Username or email already exists';
                return resFailed(res, 400, message);
            }

            const passwordHash = await HashHelper.hash(password);
            const data = { name, phoneNumber, email, password: passwordHash };
            const user = await this.userService.createUser(data);

            const message: string = 'Success create new user';
            return resSuccess(res, 201, message, { user });
        } catch (error: any) {
            logger.error('UserController.createUser', error.message);
            return resFailed(res, 500, error.message);
        }
    }

    public async updateUserById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const isExistsUser = await this.userService.getOneUserById(id as string);

            if (!isExistsUser) {
                const message: string = 'User not found';
                return resFailed(res, 404, message);
            }

            const { name, phoneNumber, email } = req.body;
            const data = { name, phoneNumber, email };
            const user = await this.userService.updateOneUserById(id as string, data);

            const message: string = 'Success update user by id';
            return resSuccess(res, 200, message, { user });
        } catch (error: any) {
            logger.error('UserController.updateUserById', error.message);
            return resFailed(res, 500, error.message);
        }
    }

    public async deleteUserById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const isExistsUser = await this.userService.getOneUserById(id as string);

            if (!isExistsUser) {
                const message: string = 'User not found';
                return resFailed(res, 404, message);
            }

            await this.userService.deleteOneUserById(id as string);

            const message: string = 'Success delete user by id';
            return resSuccess(res, 200, message);
        } catch (error: any) {
            logger.error('UserController.deleteUserById', error.message);
            return resFailed(res, 500, error.message);
        }
    }
}
