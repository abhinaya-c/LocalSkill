import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserRepository } from '../repositories/user.repository';
import { ProviderRepository } from '../repositories/provider.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { VerificationTier } from 'shared';

export class AdminController {
  static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await UserRepository.listAll();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async toggleSuspendUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserRepository.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // We can update their details or name, let's just prefix their status 
      // or record audit log for suspension toggle.
      // For safety in this environment, we toggle their email flag or set details.
      // Let's log an audit action for suspension
      const isSuspended = user.name.endsWith(' (Suspended)');
      let newName = user.name;
      if (isSuspended) {
        newName = user.name.replace(' (Suspended)', '');
      } else {
        newName = user.name + ' (Suspended)';
      }

      await UserRepository.update(id, { name: newName });

      await AuditRepository.createLog({
        userId: req.user!.id,
        action: isSuspended ? 'ADMIN_USER_UNSUSPEND' : 'ADMIN_USER_SUSPEND',
        details: `${isSuspended ? 'Unsuspended' : 'Suspended'} user ID: ${id}`,
      });

      return res.status(200).json({
        success: true,
        message: `User account has been ${isSuspended ? 'activated' : 'suspended'}.`,
        user: { ...user, name: newName },
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getVerificationRequests(req: AuthenticatedRequest, res: Response) {
    try {
      const providers = await ProviderRepository.listAll();
      // Filter those who submitted docs and are BASIC or need review
      const requests = providers.filter(
        (p: any) => p.verificationDocs.length > 0
      );
      return res.status(200).json(requests);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async approveVerification(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params; // Provider Profile ID
      const { tier } = req.body; // 'BASIC' | 'VERIFIED'

      if (!tier || !['BASIC', 'VERIFIED'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid verification tier' });
      }

      // Fetch the provider by profile ID
      const provider = await ProviderRepository.findById(id);
      if (!provider) {
        return res.status(404).json({ error: 'Provider profile not found.' });
      }

      await ProviderRepository.update(provider.userId, {
        verificationTier: tier as VerificationTier,
      });

      // Notify the provider
      await NotificationRepository.createNotification({
        userId: provider.userId,
        title: 'Verification Request Approved',
        content: `Congratulations! Your professional credentials have been verified at tier: ${tier}.`,
        type: 'SYSTEM',
      });

      await AuditRepository.createLog({
        userId: req.user!.id,
        action: 'ADMIN_VERIFICATION_APPROVE',
        details: `Approved verification tier ${tier} for provider ID: ${id}`,
      });

      return res.status(200).json({ success: true, message: 'Provider verification approved.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async rejectVerification(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params; // Provider Profile ID

      const provider = await ProviderRepository.findById(id);
      if (!provider) {
        return res.status(404).json({ error: 'Provider profile not found.' });
      }

      await ProviderRepository.update(provider.userId, {
        verificationTier: 'UNVERIFIED',
        verificationDocs: [], // Clear out documents as they were rejected
      });

      // Notify the provider
      await NotificationRepository.createNotification({
        userId: provider.userId,
        title: 'Verification Request Rejected',
        content: 'Your verification request was rejected. Please review and re-submit valid credentials.',
        type: 'SYSTEM',
      });

      await AuditRepository.createLog({
        userId: req.user!.id,
        action: 'ADMIN_VERIFICATION_REJECT',
        details: `Rejected verification docs for provider ID: ${id}`,
      });

      return res.status(200).json({ success: true, message: 'Provider verification docs rejected.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getSystemStats(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await UserRepository.listAll();
      const providers = await ProviderRepository.listAll();

      const BookingRepository = require('../repositories/booking.repository').BookingRepository;
      const customerBookings = await BookingRepository.listSlotsByProvider; // dummy placeholder ref to load imports
      
      const { mockBookings, mockReviews, mockServiceListings } = require('../repositories/mockDb');

      // Aggregate stats from DB arrays
      const totalUsers = users.length;
      const totalProviders = providers.length;
      const totalBookings = mockBookings.length;
      const totalReviews = mockReviews.length;
      const totalListings = mockServiceListings.length;

      // Group bookings by status
      const bookingStatuses = mockBookings.reduce((acc: any, curr: any) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, { REQUESTED: 0, CONFIRMED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 });

      // Group listings by category
      const listingCategories = mockServiceListings.reduce((acc: any, curr: any) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});

      return res.status(200).json({
        totalUsers,
        totalProviders,
        totalBookings,
        totalReviews,
        totalListings,
        bookingStatuses,
        listingCategories,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const logs = await AuditRepository.listAll();
      return res.status(200).json(logs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const { mockBookings, mockUsers, mockServiceListings, mockAppointmentSlots, mockProviderProfiles } = require('../repositories/mockDb');
      const resolved = mockBookings.map((b: any) => {
        const customer = mockUsers.find((u: any) => u.id === b.customerId);
        const service = mockServiceListings.find((s: any) => s.id === b.serviceId);
        const slot = mockAppointmentSlots.find((s: any) => s.id === b.slotId);
        const provider = mockProviderProfiles.find((p: any) => p.id === b.providerId);
        const providerUser = provider ? mockUsers.find((u: any) => u.id === provider.userId) : null;
        
        return {
          ...b,
          customer,
          service,
          slot,
          provider: provider ? { ...provider, user: providerUser } : null,
        };
      });
      return res.status(200).json(resolved);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
