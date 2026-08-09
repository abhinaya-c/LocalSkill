import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google', AuthController.googleOAuth);
router.post('/refresh', AuthController.refresh);
router.post('/request-reset', AuthController.requestReset);
router.post('/reset', AuthController.reset);
router.post('/logout', AuthController.logout);

export default router;
