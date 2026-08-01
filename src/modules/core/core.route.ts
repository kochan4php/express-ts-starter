import express, { Router } from 'express';
import { CoreController } from './core.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router: Router = express.Router();
const coreController = new CoreController();

router.get('/', asyncHandler(coreController.index.bind(coreController)));

export default router;
