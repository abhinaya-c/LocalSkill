import { prisma } from '../config/db';

const hasDatabase = !!process.env.DATABASE_URL;
const getMockDb = () => require('./mockDb');

export class NotificationRepository {
  static async createNotification(data: {
    userId: string;
    title: string;
    content: string;
    type: string;
  }) {
    if (hasDatabase) {
      return prisma.notification.create({
        data,
      });
    } else {
      const newNotification = {
        id: `notify-uuid-${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        isRead: false,
        createdAt: new Date(),
      };
      getMockDb().mockNotifications.push(newNotification);
      return newNotification;
    }
  }

  static async listByUser(userId: string) {
    if (hasDatabase) {
      return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return getMockDb().mockNotifications
        .filter((n: any) => n.userId === userId)
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  static async markAsRead(id: string) {
    if (hasDatabase) {
      return prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    } else {
      const index = getMockDb().mockNotifications.findIndex((n: any) => n.id === id);
      if (index !== -1) {
        getMockDb().mockNotifications[index].isRead = true;
      }
      return getMockDb().mockNotifications[index] || null;
    }
  }

  static async markAllAsRead(userId: string) {
    if (hasDatabase) {
      return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else {
      getMockDb().mockNotifications.forEach((n: any) => {
        if (n.userId === userId) {
          n.isRead = true;
        }
      });
      return { count: getMockDb().mockNotifications.filter((n: any) => n.userId === userId).length };
    }
  }
}
