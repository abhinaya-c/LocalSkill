import { prisma } from '../config/db';

const hasDatabase = !!process.env.DATABASE_URL;
const getMockDb = () => require('./mockDb');

export class ChatRepository {
  static async saveMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
    bookingId?: string;
  }) {
    if (hasDatabase) {
      return prisma.message.create({
        data,
        include: {
          sender: true,
          receiver: true,
        },
      });
    } else {
      const newMessage = {
        id: `msg-uuid-${Math.random().toString(36).substr(2, 9)}`,
        senderId: data.senderId,
        receiverId: data.receiverId,
        bookingId: data.bookingId || null,
        content: data.content,
        createdAt: new Date(),
      };
      getMockDb().mockMessages.push(newMessage);
      
      const sender = getMockDb().mockUsers.find((u: any) => u.id === data.senderId);
      const receiver = getMockDb().mockUsers.find((u: any) => u.id === data.receiverId);

      return {
        ...newMessage,
        sender,
        receiver,
      };
    }
  }

  static async getConversationHistory(userA: string, userB: string) {
    if (hasDatabase) {
      return prisma.message.findMany({
        where: {
          OR: [
            { senderId: userA, receiverId: userB },
            { senderId: userB, receiverId: userA },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      return getMockDb().mockMessages
        .filter(
          (m: any) =>
            (m.senderId === userA && m.receiverId === userB) ||
            (m.senderId === userB && m.receiverId === userA)
        )
        .sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime());
    }
  }

  static async getRecentChatPartners(userId: string) {
    if (hasDatabase) {
      // Direct SQL or Prisma complex query to get list of distinct users chatted with
      const messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        orderBy: { createdAt: 'desc' },
      });

      const partnersMap = new Map<string, any>();
      for (const msg of messages) {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        if (!partnersMap.has(partnerId)) {
          // Fetch the partner details
          const partner = await prisma.user.findUnique({ where: { id: partnerId } });
          partnersMap.set(partnerId, {
            partner,
            lastMessage: msg,
          });
        }
      }
      return Array.from(partnersMap.values());
    } else {
      const messages = [...getMockDb().mockMessages].sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
      const partnersMap = new Map<string, any>();

      for (const msg of messages) {
        if (msg.senderId === userId || msg.receiverId === userId) {
          const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
          if (!partnersMap.has(partnerId)) {
            const partner = getMockDb().mockUsers.find((u: any) => u.id === partnerId);
            partnersMap.set(partnerId, {
              partner,
              lastMessage: msg,
            });
          }
        }
      }
      return Array.from(partnersMap.values());
    }
  }
}
