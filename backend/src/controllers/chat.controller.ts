import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ChatRepository } from '../repositories/chat.repository';
import { MessageSchema } from 'shared';
import { NotificationRepository } from '../repositories/notification.repository';

export class ChatController {
  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const senderId = req.user!.id;
      const body = MessageSchema.parse(req.body);

      const message = await ChatRepository.saveMessage({
        senderId,
        ...body,
      });

      // Realtime event push via Socket.IO
      const io = req.app.get('io');
      if (io) {
        // Emit to the specific receiver room
        io.to(body.receiverId).emit('receive_message', message);
      }

      // Also trigger a notification in case they are offline
      await NotificationRepository.createNotification({
        userId: body.receiverId,
        title: 'New Message Received',
        content: `${message.sender?.name || 'A user'} sent you a message: "${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}"`,
        type: 'MESSAGE',
      });

      return res.status(201).json(message);
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { partnerId } = req.params;

      const history = await ChatRepository.getConversationHistory(userId, partnerId);
      return res.status(200).json(history);
    } catch (error: any) {
      console.error('Error in getHistory:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async getInbox(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const inbox = await ChatRepository.getRecentChatPartners(userId);
      return res.status(200).json(inbox);
    } catch (error: any) {
      console.error('Error in getInbox:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}
