import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', requireAuth, ProfileController.getMe);
router.put('/me', requireAuth, ProfileController.updateMe);
router.delete('/me', requireAuth, ProfileController.deactivateAccount);

router.get('/provider/:userId', requireAuth, ProfileController.getProviderProfile);
router.get('/user/:id', requireAuth, ProfileController.getUserProfile);
router.put('/provider', requireAuth, requireRoles('PROVIDER'), ProfileController.updateProviderProfile);
router.post('/provider/verify', requireAuth, requireRoles('PROVIDER'), ProfileController.uploadVerification);
router.post('/provider/portfolio', requireAuth, requireRoles('PROVIDER'), ProfileController.uploadPortfolio);

export default router;
