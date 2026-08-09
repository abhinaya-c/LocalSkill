import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Booking routes
router.get('/customer', requireAuth, BookingController.getCustomerBookings);
router.get('/provider', requireAuth, requireRoles('PROVIDER'), BookingController.getProviderBookings);
router.get('/:id', requireAuth, BookingController.getBookingDetails);

router.post('/', requireAuth, requireRoles('CUSTOMER'), BookingController.requestBooking);
router.post('/:id/accept', requireAuth, requireRoles('PROVIDER'), BookingController.acceptBooking);
router.post('/:id/decline', requireAuth, requireRoles('PROVIDER'), BookingController.declineBooking);
router.post('/:id/complete', requireAuth, requireRoles('PROVIDER'), BookingController.completeBooking);
router.post('/:id/cancel', requireAuth, BookingController.cancelBooking);

// Slot routes
router.post('/slots', requireAuth, requireRoles('PROVIDER'), BookingController.createSlot);
router.get('/slots/provider/:providerId', requireAuth, BookingController.getProviderSlots);
router.delete('/slots/:id', requireAuth, requireRoles('PROVIDER'), BookingController.deleteSlot);

export default router;
