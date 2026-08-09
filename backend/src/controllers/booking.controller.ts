import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { BookingRepository } from '../repositories/booking.repository';
import { ProviderRepository } from '../repositories/provider.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { BookingSchema } from 'shared';

export class BookingController {
  // Slots endpoints
  static async createSlot(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const provider = await ProviderRepository.findByUserId(userId);
      if (!provider) {
        return res.status(403).json({ error: 'Only registered providers can create availability slots.' });
      }

      const { startTime, endTime } = req.body;
      if (!startTime || !endTime) {
        return res.status(400).json({ error: 'Start time and End time are required.' });
      }

      const slot = await BookingRepository.createSlot({
        providerId: provider.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });

      return res.status(201).json(slot);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getProviderSlots(req: AuthenticatedRequest, res: Response) {
    try {
      const { providerId } = req.params;
      const { includeBooked } = req.query;

      const slots = await BookingRepository.listSlotsByProvider(
        providerId,
        includeBooked === 'true'
      );
      return res.status(200).json(slots);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteSlot(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const provider = await ProviderRepository.findByUserId(userId);
      const slot = await BookingRepository.findSlotById(id);

      if (!slot) {
        return res.status(404).json({ error: 'Slot not found' });
      }

      if (!provider || slot.providerId !== provider.id) {
        return res.status(403).json({ error: 'You are not authorized to delete this slot.' });
      }

      if (slot.isBooked) {
        return res.status(400).json({ error: 'Cannot delete a slot that is already booked.' });
      }

      await BookingRepository.deleteSlot(id);
      return res.status(200).json({ success: true, message: 'Slot removed successfully.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Booking endpoints
  static async requestBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const customerId = req.user!.id;
      const body = BookingSchema.parse(req.body);

      // Find the service listing to get the provider details
      const ServiceRepository = require('../repositories/service.repository').ServiceRepository;
      const service = await ServiceRepository.findById(body.serviceId);
      if (!service) {
        return res.status(404).json({ error: 'Service listing not found' });
      }

      const booking = await BookingRepository.createBooking({
        customerId,
        providerId: service.providerId,
        serviceId: body.serviceId,
        slotId: body.slotId,
        notes: body.notes,
      });

      // Send in-app notification to the Provider
      const providerProfile = await ProviderRepository.findById(service.providerId);
      if (providerProfile) {
        await NotificationRepository.createNotification({
          userId: providerProfile.userId,
          title: 'New Booking Request',
          content: `You received a booking request for "${service.title}" from customer.`,
          type: 'BOOKING',
        });
      }

      await AuditRepository.createLog({
        userId: customerId,
        action: 'BOOKING_REQUEST',
        details: `Requested booking ID: ${booking.id}`,
      });

      return res.status(201).json(booking);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async acceptBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const provider = await ProviderRepository.findByUserId(userId);
      const booking = await BookingRepository.findById(id);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (!provider || booking.providerId !== provider.id) {
        return res.status(403).json({ error: 'You are not authorized to accept this booking.' });
      }

      const updated = await BookingRepository.updateStatus(id, 'CONFIRMED');

      // Notify customer
      await NotificationRepository.createNotification({
        userId: booking.customerId,
        title: 'Booking Confirmed',
        content: `Your booking for "${booking.service?.title || 'Service'}" has been confirmed!`,
        type: 'BOOKING',
      });

      await AuditRepository.createLog({
        userId,
        action: 'BOOKING_CONFIRM',
        details: `Confirmed booking ID: ${id}`,
      });

      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async declineBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const provider = await ProviderRepository.findByUserId(userId);
      const booking = await BookingRepository.findById(id);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (!provider || booking.providerId !== provider.id) {
        return res.status(403).json({ error: 'You are not authorized to decline this booking.' });
      }

      const updated = await BookingRepository.updateStatus(id, 'CANCELLED');

      // Notify customer
      await NotificationRepository.createNotification({
        userId: booking.customerId,
        title: 'Booking Declined',
        content: `Your booking for "${booking.service?.title || 'Service'}" was declined by the provider.`,
        type: 'BOOKING',
      });

      await AuditRepository.createLog({
        userId,
        action: 'BOOKING_DECLINE',
        details: `Declined booking ID: ${id}`,
      });

      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async completeBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const provider = await ProviderRepository.findByUserId(userId);
      const booking = await BookingRepository.findById(id);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (!provider || booking.providerId !== provider.id) {
        return res.status(403).json({ error: 'You are not authorized to complete this booking.' });
      }

      const updated = await BookingRepository.updateStatus(id, 'COMPLETED');

      // Notify customer (triggers review workflow)
      await NotificationRepository.createNotification({
        userId: booking.customerId,
        title: 'Service Completed',
        content: `Your booking for "${booking.service?.title || 'Service'}" was marked complete. Please write a review!`,
        type: 'BOOKING',
      });

      await AuditRepository.createLog({
        userId,
        action: 'BOOKING_COMPLETE',
        details: `Completed booking ID: ${id}`,
      });

      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async cancelBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const booking = await BookingRepository.findById(id);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const provider = await ProviderRepository.findByUserId(userId);

      // Check authorization (either the customer or the booking provider)
      const isCustomer = booking.customerId === userId;
      const isProvider = provider && booking.providerId === provider.id;

      if (!isCustomer && !isProvider) {
        return res.status(403).json({ error: 'You are not authorized to cancel this booking.' });
      }

      const updated = await BookingRepository.updateStatus(id, 'CANCELLED');

      // Notify other party
      const notifyUserId = isCustomer ? booking.provider?.userId || '' : booking.customerId;
      await NotificationRepository.createNotification({
        userId: notifyUserId,
        title: 'Booking Cancelled',
        content: `The booking for "${booking.service?.title || 'Service'}" was cancelled.`,
        type: 'BOOKING',
      });

      await AuditRepository.createLog({
        userId,
        action: 'BOOKING_CANCEL',
        details: `Cancelled booking ID: ${id}`,
      });

      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getCustomerBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const customerId = req.user!.id;
      const bookings = await BookingRepository.listByCustomer(customerId);
      return res.status(200).json(bookings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getProviderBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const provider = await ProviderRepository.findByUserId(userId);
      if (!provider) {
        return res.status(403).json({ error: 'Only providers can view provider bookings.' });
      }

      const bookings = await BookingRepository.listByProvider(provider.id);
      
      // Privacy protection: mask customer address and phone number unless the booking status is CONFIRMED, IN_PROGRESS, or COMPLETED.
      const allowedStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
      const sanitizedBookings = bookings.map((b: any) => {
        if (b.customer && !allowedStatuses.includes(b.status)) {
          return {
            ...b,
            customer: {
              ...b.customer,
              address: 'Restricted (Visible once booking is confirmed)',
              phone: b.customer.phone ? b.customer.phone.replace(/.(?=.{4})/g, '*') : null,
            }
          };
        }
        return b;
      });

      return res.status(200).json(sanitizedBookings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getBookingDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const booking = await BookingRepository.findById(id);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check permission
      const provider = await ProviderRepository.findByUserId(req.user!.id);
      const isCustomer = booking.customerId === req.user!.id;
      const isProvider = provider && booking.providerId === provider.id;
      const isAdmin = req.user!.role === 'ADMIN';

      if (!isCustomer && !isProvider && !isAdmin) {
        return res.status(403).json({ error: 'Access denied.' });
      }

      // Privacy protection: mask customer address and phone number unless the booking status is CONFIRMED, IN_PROGRESS, or COMPLETED.
      const allowedStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
      let responseBooking: any = booking;
      if (isProvider && booking.customer && !allowedStatuses.includes(booking.status)) {
        responseBooking = {
          ...booking,
          customer: {
            ...(booking.customer as any),
            address: 'Restricted (Visible once booking is confirmed)',
            phone: (booking.customer as any).phone ? (booking.customer as any).phone.replace(/.(?=.{4})/g, '*') : null,
          }
        };
      }

      return res.status(200).json(responseBooking);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
