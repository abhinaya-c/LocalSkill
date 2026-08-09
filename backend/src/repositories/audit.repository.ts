import { prisma } from '../config/db';
import { mockAuditLogs } from './mockDb';

const hasDatabase = !!process.env.DATABASE_URL;

export class AuditRepository {
  static async createLog(data: {
    userId?: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
  }) {
    if (hasDatabase) {
      return prisma.auditLog.create({
        data,
      });
    } else {
      const newLog = {
        id: `audit-uuid-${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId || null,
        action: data.action,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        details: data.details || null,
        createdAt: new Date(),
      };
      mockAuditLogs.push(newLog);
      return newLog;
    }
  }

  static async listAll() {
    if (hasDatabase) {
      return prisma.auditLog.findMany({
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      const { mockUsers } = require('./mockDb');
      return mockAuditLogs
        .map((log) => {
          const user = log.userId ? mockUsers.find((u: any) => u.id === log.userId) : null;
          return {
            ...log,
            user,
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }
}
