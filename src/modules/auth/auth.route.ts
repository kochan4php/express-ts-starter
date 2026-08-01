import express, { Router } from 'express';
import { AuthController } from './auth.controller';
import { UserService } from '../users/users.service';
import { userRepository } from '../users/users.repository';
import { SessionService } from './session.service';
import { sessionRepository } from './session.repository';

import { asyncHandler } from '../../common/utils/asyncHandler';

import { validate } from '../../common/middlewares/validate.middleware';
import { loginSchema, registerSchema } from './auth.dto';

const router: Router = express.Router();

const userService = new UserService(userRepository);
const sessionService = new SessionService(sessionRepository);
const authController = new AuthController(userService, sessionService);

router.post('/login', validate(loginSchema), asyncHandler(authController.login.bind(authController)));
router.post('/register', validate(registerSchema), asyncHandler(authController.register.bind(authController)));
router.delete('/logout', asyncHandler(authController.logout.bind(authController)));
router.get('/refresh-token', asyncHandler(authController.refreshToken.bind(authController)));

export default router;
