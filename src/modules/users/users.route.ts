import { UserController } from './users.controller';
import { container } from '../../container';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { validate } from '../../common/middlewares/validate.middleware';
import { createUserSchema, updateUserSchema, getUsersSchema } from './users.dto';
import { BaseRoute } from '../../common/base.route';
import auth from '../../common/middlewares/auth.middleware';
import isAdmin from '../../common/middlewares/is-admin.middleware';

import { injectable } from 'tsyringe';

@injectable()
export class UserRoute extends BaseRoute {
    private userController: UserController;

    constructor() {
        super('/api/admin/users');
        this.userController = container.resolve(UserController);
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        this.router.use(auth, isAdmin); // Applying middlewares for all routes under this path
        this.router.get('/', validate(getUsersSchema), asyncHandler(this.userController.getAllUsers.bind(this.userController)));
        this.router.get('/:id', asyncHandler(this.userController.getUserById.bind(this.userController)));
        this.router.post('/', validate(createUserSchema), asyncHandler(this.userController.createUser.bind(this.userController)));
        this.router.put('/:id', validate(updateUserSchema), asyncHandler(this.userController.updateUserById.bind(this.userController)));
        this.router.delete('/:id', asyncHandler(this.userController.deleteUserById.bind(this.userController)));
    }
}
