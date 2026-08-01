import { HealthController } from './health.controller';
import { container } from '../container';
import { asyncHandler } from '../common/utils/asyncHandler';
import { BaseRoute } from '../common/base.route';

import { injectable } from 'tsyringe';

@injectable()
export class HealthRoute extends BaseRoute {
    private healthController: HealthController;

    constructor() {
        super('/api/health-check');
        this.healthController = container.resolve(HealthController);
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        this.router.get('/', asyncHandler(this.healthController.healthCheck.bind(this.healthController)));
        this.router.get('/db', asyncHandler(this.healthController.dbHealthCheck.bind(this.healthController)));
    }
}
