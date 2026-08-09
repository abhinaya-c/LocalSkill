import { prisma } from '../config/db';
import { VerificationTier } from 'shared';

const hasDatabase = !!process.env.DATABASE_URL;
const getMockDb = () => require('./mockDb');

export class ProviderRepository {
  static async findByUserId(userId: string) {
    if (hasDatabase) {
      return prisma.providerProfile.findUnique({
        where: { userId },
        include: { user: true },
      });
    } else {
      const profile = getMockDb().mockProviderProfiles.find((p: any) => p.userId === userId);
      if (!profile) return null;
      const user = getMockDb().mockUsers.find((u: any) => u.id === userId);
      return { ...profile, user };
    }
  }

  static async findById(id: string) {
    if (hasDatabase) {
      return prisma.providerProfile.findUnique({
        where: { id },
        include: { user: true, listings: true },
      });
    } else {
      const profile = getMockDb().mockProviderProfiles.find((p: any) => p.id === id);
      if (!profile) return null;
      const user = getMockDb().mockUsers.find((u: any) => u.id === profile.userId);
      return { ...profile, user };
    }
  }

  static async update(userId: string, data: {
    bio?: string;
    skills?: string[];
    contactInfo?: string;
    verificationTier?: VerificationTier;
    verificationDocs?: string[];
    portfolio?: string[];
    latitude?: number;
    longitude?: number;
    averageRating?: number;
    reviewCount?: number;
  }) {
    if (hasDatabase) {
      return prisma.providerProfile.update({
        where: { userId },
        data,
      });
    } else {
      const index = getMockDb().mockProviderProfiles.findIndex((p: any) => p.userId === userId);
      if (index === -1) {
        // Create a new provider profile if one does not exist
        const newProfile = {
          id: `profile-uuid-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          bio: data.bio || '',
          skills: data.skills || [],
          contactInfo: data.contactInfo || '',
          verificationTier: data.verificationTier || ('UNVERIFIED' as VerificationTier),
          verificationDocs: data.verificationDocs || [],
          portfolio: data.portfolio || [],
          latitude: data.latitude || 28.2096,
          longitude: data.longitude || 83.9856,
          averageRating: data.averageRating || 0.0,
          reviewCount: data.reviewCount || 0,
        };
        getMockDb().mockProviderProfiles.push(newProfile);
        return newProfile;
      }

      const updated = {
        ...getMockDb().mockProviderProfiles[index],
        ...data,
      };
      getMockDb().mockProviderProfiles[index] = updated;
      return updated;
    }
  }

  static async listAll() {
    if (hasDatabase) {
      return prisma.providerProfile.findMany({
        include: { user: true },
      });
    } else {
      return getMockDb().mockProviderProfiles.map((p: any) => {
        const user = getMockDb().mockUsers.find((u: any) => u.id === p.userId);
        return { ...p, user };
      });
    }
  }
}
