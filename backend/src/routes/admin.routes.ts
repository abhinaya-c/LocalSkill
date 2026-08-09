import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/users', requireAuth, requireRoles('ADMIN'), AdminController.getUsers);
router.post('/users/:id/suspend', requireAuth, requireRoles('ADMIN'), AdminController.toggleSuspendUser);

router.get('/verifications', requireAuth, requireRoles('ADMIN'), AdminController.getVerificationRequests);
router.post('/verifications/:id/approve', requireAuth, requireRoles('ADMIN'), AdminController.approveVerification);
router.post('/verifications/:id/reject', requireAuth, requireRoles('ADMIN'), AdminController.rejectVerification);

router.get('/stats', requireAuth, requireRoles('ADMIN'), AdminController.getSystemStats);
router.get('/logs', requireAuth, requireRoles('ADMIN'), AdminController.getAuditLogs);
router.get('/bookings', requireAuth, requireRoles('ADMIN'), AdminController.getBookings);

export default router;
