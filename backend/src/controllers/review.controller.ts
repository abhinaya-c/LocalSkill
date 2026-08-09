import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ReviewRepository } from '../repositories/review.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { ReviewSchema } from 'shared';

export class ReviewController {
  static async submitReview(req: AuthenticatedRequest, res: Response) {
    try {
      const customerId = req.user!.id;
      const body = ReviewSchema.parse(req.body);

      // 1. Fetch booking details
      const booking = await BookingRepository.findById(body.bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Associated booking not found.' });
      }

      // 2. Security Check: Only the booking customer can write the review
      if (booking.customerId !== customerId) {
        return res.status(403).json({ error: 'You are not authorized to review this booking.' });
      }

      // 3. Security Check: Booking must be marked COMPLETED
      if (booking.status !== 'COMPLETED') {
        return res.status(400).json({ error: 'Reviews can only be submitted after the service is marked complete.' });
      }

      // 4. Integrity Check: Detect duplicate reviews for the same booking
      const exists = await ReviewRepository.checkDuplicateReview(body.bookingId);
      if (exists) {
        return res.status(400).json({ error: 'You have already submitted a review for this booking.' });
      }

      // 5. Fraud Prevention Rule: Detect IP matches (Self-Review Prevention)
      const customerIp = req.ip || req.socket.remoteAddress;
      
      // Fetch provider profile and provider user
      const ProviderRepository = require('../repositories/provider.repository').ProviderRepository;
      const provider = await ProviderRepository.findById(booking.providerId);
      
      if (provider && provider.user) {
        // Fetch provider last login logs to match IP addresses
        const auditLogs = await AuditRepository.listAll();
        const providerLoginLog = auditLogs.find(
          (log: any) => log.userId === provider.userId && log.action === 'USER_LOGIN'
        );

        if (providerLoginLog && providerLoginLog.ipAddress === customerIp && process.env.NODE_ENV === 'production') {
          return res.status(400).json({
            error: 'Fraudulent review detected. Customers and providers sharing network IPs cannot review each other.',
          });
        }
      }

      // 6. Create Review
      const review = await ReviewRepository.createReview({
        bookingId: body.bookingId,
        customerId,
        providerId: booking.providerId,
        rating: body.rating,
        comment: body.comment,
      });

      // 7. Notify Provider
      if (provider) {
        await NotificationRepository.createNotification({
          userId: provider.userId,
          title: 'New Review Received',
          content: `A customer left you a ${body.rating}-star review: "${body.comment?.substring(0, 30) || ''}..."`,
          type: 'REVIEW',
        });
      }

      await AuditRepository.createLog({
        userId: customerId,
        action: 'REVIEW_SUBMIT',
        details: `Submitted review for booking ID: ${body.bookingId}`,
      });

      return res.status(201).json(review);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async getProviderReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const { providerId } = req.params;
      const reviews = await ReviewRepository.listByProvider(providerId);
      return res.status(200).json(reviews);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
