import { container } from 'tsyringe';
import { UserRepository } from './modules/users/users.repository';
import { SessionRepository } from './modules/auth/session.repository';
import { UserService } from './modules/users/users.service';
import { SessionService } from './modules/auth/session.service';
import { UserController } from './modules/users/users.controller';
import { AuthController } from './modules/auth/auth.controller';

// Register Repositories
container.registerSingleton('IUserRepository', UserRepository);
container.registerSingleton('ISessionRepository', SessionRepository);

// Services and Controllers can be auto-resolved by tsyringe
// as long as they are decorated with @injectable()

export { container };
