import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, NotificationController.getMyNotifications);
router.post('/read-all', requireAuth, NotificationController.markAllRead);
router.post('/:id/read', requireAuth, NotificationController.markRead);

export default router;
