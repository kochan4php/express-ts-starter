import { AuthController } from './auth.controller';
import { container } from '../../container';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { validate } from '../../common/middlewares/validate.middleware';
import { loginSchema, registerSchema } from './auth.dto';
import { rateLimit } from 'express-rate-limit';
import { authLimitterConfig } from '../../config/app';
import { BaseRoute } from '../../common/base.route';

import { injectable } from 'tsyringe';

@injectable()
export class AuthRoute extends BaseRoute {
    private authController: AuthController;

    constructor() {
        super('/api/auth');
        this.authController = container.resolve(AuthController);
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        const authLimiter = rateLimit(authLimitterConfig());

        this.router.post('/login', authLimiter, validate(loginSchema), asyncHandler(this.authController.login.bind(this.authController)));
        this.router.post('/register', authLimiter, validate(registerSchema), asyncHandler(this.authController.register.bind(this.authController)));
        this.router.delete('/logout', asyncHandler(this.authController.logout.bind(this.authController)));
        this.router.get('/refresh-token', asyncHandler(this.authController.refreshToken.bind(this.authController)));
    }
}
