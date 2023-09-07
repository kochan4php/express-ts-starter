/**
 * @description This file contain all routes for authentication endpoints
 * @author {Deo Sbrn}
 */

import express, { Router } from 'express';
import AuthController from '../app/controllers/auth.controller';

const router: Router = express.Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.delete('/logout', AuthController.logout);
router.get('/refresh-token', AuthController.refreshToken);

export default router;
