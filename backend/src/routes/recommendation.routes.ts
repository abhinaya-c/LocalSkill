import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, RecommendationController.getRecommendations);

export default router;
