import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/provider/:providerId', requireAuth, ReviewController.getProviderReviews);
router.post('/', requireAuth, ReviewController.submitReview);

export default router;
