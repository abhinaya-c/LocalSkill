import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/inbox', requireAuth, ChatController.getInbox);
router.get('/history/:partnerId', requireAuth, ChatController.getHistory);
router.post('/message', requireAuth, ChatController.sendMessage);

export default router;
