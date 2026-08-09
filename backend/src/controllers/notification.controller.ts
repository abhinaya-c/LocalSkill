import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { NotificationRepository } from '../repositories/notification.repository';

export class NotificationController {
  static async getMyNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const notifications = await NotificationRepository.listByUser(userId);
      return res.status(200).json(notifications);
    } catch (error: any) {
      console.error('Error in getMyNotifications:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const notification = await NotificationRepository.markAsRead(id);
      return res.status(200).json(notification);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await NotificationRepository.markAllAsRead(userId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
