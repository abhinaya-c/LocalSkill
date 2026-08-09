import { prisma } from '../config/db';
import { UserRole } from 'shared';

const hasDatabase = !!process.env.DATABASE_URL;
const getMockDb = () => require('./mockDb');

export class UserRepository {
  static async create(data: {
    name: string;
    email: string;
    phone?: string;
    passwordHash: string;
    role: UserRole;
    avatarUrl?: string;
    address?: string;
  }) {
    if (hasDatabase) {
      return prisma.user.create({
        data,
      });
    } else {
      const newUser = {
        id: `user-uuid-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        passwordHash: data.passwordHash,
        role: data.role,
        avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      getMockDb().mockUsers.push(newUser);

      // If they are a provider, initialize their provider profile too!
      if (data.role === 'PROVIDER') {
        const newProfile = {
          id: `profile-uuid-${Math.random().toString(36).substr(2, 9)}`,
          userId: newUser.id,
          bio: '',
          skills: [],
          contactInfo: '',
          verificationTier: 'UNVERIFIED' as any,
          verificationDocs: [],
          portfolio: [],
          latitude: 28.2096, // Default to Pokhara coordinates
          longitude: 83.9856,
          averageRating: 0,
          reviewCount: 0,
        };
        getMockDb().mockProviderProfiles.push(newProfile);
      }

      return newUser;
    }
  }

  static async findByEmail(email: string) {
    if (hasDatabase) {
      return prisma.user.findUnique({
        where: { email },
        include: { providerProfile: true },
      });
    } else {
      const user = getMockDb().mockUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return null;
      const profile = getMockDb().mockProviderProfiles.find((p: any) => p.userId === user.id);
      return { ...user, providerProfile: profile || null };
    }
  }

  static async findById(id: string) {
    if (hasDatabase) {
      return prisma.user.findUnique({
        where: { id },
        include: { providerProfile: true },
      });
    } else {
      const user = getMockDb().mockUsers.find((u: any) => u.id === id);
      if (!user) return null;
      const profile = getMockDb().mockProviderProfiles.find((p: any) => p.userId === user.id);
      return { ...user, providerProfile: profile || null };
    }
  }

  static async update(id: string, data: {
    name?: string;
    phone?: string;
    passwordHash?: string;
    avatarUrl?: string;
    address?: string;
  }) {
    if (hasDatabase) {
      return prisma.user.update({
        where: { id },
        data,
      });
    } else {
      const index = getMockDb().mockUsers.findIndex((u: any) => u.id === id);
      if (index === -1) throw new Error('User not found');
      
      const updated = {
        ...getMockDb().mockUsers[index],
        ...data,
      };
      getMockDb().mockUsers[index] = updated;
      return updated;
    }
  }

  static async delete(id: string) {
    if (hasDatabase) {
      return prisma.user.delete({
        where: { id },
      });
    } else {
      const index = getMockDb().mockUsers.findIndex((u: any) => u.id === id);
      if (index === -1) throw new Error('User not found');
      const user = getMockDb().mockUsers[index];
      getMockDb().mockUsers.splice(index, 1);
      return user;
    }
  }

  static async listAll() {
    if (hasDatabase) {
      return prisma.user.findMany({
        include: { providerProfile: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return getMockDb().mockUsers.map((u: any) => {
        const profile = getMockDb().mockProviderProfiles.find((p: any) => p.userId === u.id);
        return { ...u, providerProfile: profile || null };
      });
    }
  }
}
