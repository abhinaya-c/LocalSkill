import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserRepository } from '../repositories/user.repository';
import { ProviderRepository } from '../repositories/provider.repository';
import { ProviderProfileSchema } from 'shared';
import { AuditRepository } from '../repositories/audit.repository';

export class ProfileController {
  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateMe(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, phone, avatarUrl, address } = req.body;

      const user = await UserRepository.update(userId, { name, phone, avatarUrl, address });
      
      await AuditRepository.createLog({
        userId,
        action: 'PROFILE_UPDATE_USER',
        details: 'Updated user personal details',
      });

      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getProviderProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const profile = await ProviderRepository.findByUserId(userId);
      if (!profile) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      return res.status(200).json(profile);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserRepository.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateProviderProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const body = ProviderProfileSchema.parse(req.body);

      const profile = await ProviderRepository.update(userId, body);

      await AuditRepository.createLog({
        userId,
        action: 'PROFILE_UPDATE_PROVIDER',
        details: 'Updated provider details, bio, or skills',
      });

      return res.status(200).json(profile);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async uploadVerification(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { documentUrls } = req.body;

      if (!documentUrls || !Array.isArray(documentUrls) || documentUrls.length === 0) {
        return res.status(400).json({ error: 'Verification documents (URLs) are required.' });
      }

      const profile = await ProviderRepository.update(userId, {
        verificationDocs: documentUrls,
        verificationTier: 'BASIC', // Mark as BASIC pending admin review
      });

      await AuditRepository.createLog({
        userId,
        action: 'PROVIDER_VERIFICATION_SUBMIT',
        details: 'Uploaded verification documents',
      });

      return res.status(200).json(profile);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async uploadPortfolio(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { portfolioUrls } = req.body;

      if (!portfolioUrls || !Array.isArray(portfolioUrls)) {
        return res.status(400).json({ error: 'Portfolio URLs are required' });
      }

      const profile = await ProviderRepository.update(userId, {
        portfolio: portfolioUrls,
      });

      await AuditRepository.createLog({
        userId,
        action: 'PROVIDER_PORTFOLIO_UPDATE',
        details: 'Updated portfolio galleries',
      });

      return res.status(200).json(profile);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async deactivateAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await UserRepository.delete(userId);

      await AuditRepository.createLog({
        action: 'USER_DEACTIVATE',
        details: `User ID ${userId} deleted account`,
      });

      res.clearCookie('refreshToken');
      return res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
