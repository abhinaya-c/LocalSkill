import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/search', requireAuth, ServiceController.searchServices);
router.get('/provider', requireAuth, requireRoles('PROVIDER'), ServiceController.getMyServices);
router.get('/:id', requireAuth, ServiceController.getServiceDetails);

router.post('/', requireAuth, requireRoles('PROVIDER'), ServiceController.createService);
router.put('/:id', requireAuth, requireRoles('PROVIDER'), ServiceController.updateService);
router.delete('/:id', requireAuth, requireRoles('PROVIDER'), ServiceController.deleteService);

export default router;
