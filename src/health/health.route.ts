import express, { Router } from 'express';
import { HealthController } from './health.controller';
import { asyncHandler } from '../common/utils/asyncHandler';

const router: Router = express.Router();
const healthController = new HealthController();

router.get('/', asyncHandler(healthController.healthCheck.bind(healthController)));
router.get('/db', asyncHandler(healthController.dbHealthCheck.bind(healthController)));

export default router;
