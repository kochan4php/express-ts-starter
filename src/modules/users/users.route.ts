import express, { Router } from 'express';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { userRepository } from './users.repository';

import { asyncHandler } from '../../common/utils/asyncHandler';

import { validate } from '../../common/middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from './users.dto';

const router: Router = express.Router();

const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/', asyncHandler(userController.getAllUsers.bind(userController)));
router.get('/:id', asyncHandler(userController.getUserById.bind(userController)));
router.post('/', validate(createUserSchema), asyncHandler(userController.createUser.bind(userController)));
router.put('/:id', validate(updateUserSchema), asyncHandler(userController.updateUserById.bind(userController)));
router.delete('/:id', asyncHandler(userController.deleteUserById.bind(userController)));

export default router;
