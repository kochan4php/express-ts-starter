/**
 * @description This file contain all routes for user endpoints
 * @author {Deo Sbrn}
 */

import express, { Router } from 'express';
import UserController from '../../app/controllers/admin/user.controller';

const router: Router = express.Router();

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUserById);
router.delete('/:id', UserController.deleteUserById);

export default router;
