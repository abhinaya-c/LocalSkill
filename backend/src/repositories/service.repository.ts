import { prisma } from '../config/db';
import { PricingModel } from 'shared';

const hasDatabase = !!process.env.DATABASE_URL;
const getMockDb = () => require('./mockDb');

export class ServiceRepository {
  static async create(data: {
    providerId: string;
    title: string;
    category: string;
    description: string;
    pricingModel: PricingModel;
    price: number;
  }) {
    if (hasDatabase) {
      return prisma.serviceListing.create({
        data,
      });
    } else {
      const newListing = {
        id: `listing-uuid-${Math.random().toString(36).substr(2, 9)}`,
        providerId: data.providerId,
        title: data.title,
        category: data.category,
        description: data.description,
        pricingModel: data.pricingModel,
        price: data.price,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      getMockDb().mockServiceListings.push(newListing);
      return newListing;
    }
  }

  static async update(id: string, data: {
    title?: string;
    category?: string;
    description?: string;
    pricingModel?: PricingModel;
    price?: number;
    isActive?: boolean;
  }) {
    if (hasDatabase) {
      return prisma.serviceListing.update({
        where: { id },
        data,
      });
    } else {
      const index = getMockDb().mockServiceListings.findIndex((s: any) => s.id === id);
      if (index === -1) throw new Error('Service listing not found');
      const updated = {
        ...getMockDb().mockServiceListings[index],
        ...data,
      };
      getMockDb().mockServiceListings[index] = updated;
      return updated;
    }
  }

  static async delete(id: string) {
    if (hasDatabase) {
      return prisma.serviceListing.delete({
        where: { id },
      });
    } else {
      const index = getMockDb().mockServiceListings.findIndex((s: any) => s.id === id);
      if (index === -1) throw new Error('Service listing not found');
      const deleted = getMockDb().mockServiceListings[index];
      getMockDb().mockServiceListings.splice(index, 1);
      return deleted;
    }
  }

  static async findById(id: string) {
    if (hasDatabase) {
      return prisma.serviceListing.findUnique({
        where: { id },
        include: { provider: { include: { user: true } } },
      });
    } else {
      const listing = getMockDb().mockServiceListings.find((s: any) => s.id === id);
      if (!listing) return null;
      const provider = getMockDb().mockProviderProfiles.find((p: any) => p.id === listing.providerId);
      const user = provider ? getMockDb().mockUsers.find((u: any) => u.id === provider.userId) : null;
      
      return {
        ...listing,
        provider: provider ? { ...provider, user } : null,
      };
    }
  }

  static async listByProvider(providerId: string) {
    if (hasDatabase) {
      return prisma.serviceListing.findMany({
        where: { providerId },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return getMockDb().mockServiceListings.filter((s: any) => s.providerId === providerId);
    }
  }

  static async searchAndFilter(filters: {
    keyword?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    verificationTier?: string;
  }) {
    if (hasDatabase) {
      const whereClause: any = { isActive: true };

      if (filters.category) {
        whereClause.category = filters.category;
      }

      if (filters.keyword) {
        whereClause.OR = [
          { title: { contains: filters.keyword, mode: 'insensitive' } },
          { description: { contains: filters.keyword, mode: 'insensitive' } },
        ];
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        whereClause.price = {};
        if (filters.minPrice !== undefined) whereClause.price.gte = filters.minPrice;
        if (filters.maxPrice !== undefined) whereClause.price.lte = filters.maxPrice;
      }

      if (filters.minRating !== undefined || filters.verificationTier) {
        whereClause.provider = {};
        if (filters.minRating !== undefined) {
          whereClause.provider.averageRating = { gte: filters.minRating };
        }
        if (filters.verificationTier) {
          whereClause.provider.verificationTier = filters.verificationTier;
        }
      }

      return prisma.serviceListing.findMany({
        where: whereClause,
        include: {
          provider: {
            include: {
              user: true,
            },
          },
        },
      });
    } else {
      // In-Memory Search & Filtering
      let results = [...getMockDb().mockServiceListings];

      // Exclude inactive listings
      results = results.filter((s) => s.isActive);

      if (filters.category && filters.category !== '') {
        results = results.filter((s) => s.category.toLowerCase() === filters.category!.toLowerCase());
      }

      if (filters.keyword && filters.keyword !== '') {
        const kw = filters.keyword.toLowerCase();
        results = results.filter(
          (s) => s.title.toLowerCase().includes(kw) || s.description.toLowerCase().includes(kw)
        );
      }

      if (filters.minPrice !== undefined) {
        results = results.filter((s) => s.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        results = results.filter((s) => s.price <= filters.maxPrice!);
      }

      return results.map((s) => {
        const provider = getMockDb().mockProviderProfiles.find((p: any) => p.id === s.providerId);
        const user = provider ? getMockDb().mockUsers.find((u: any) => u.id === provider.userId) : null;
        
        return {
          ...s,
          provider: provider ? { ...provider, user } : null,
        };
      }).filter((item) => {
        if (!item.provider) return false;
        
        if (filters.minRating !== undefined && item.provider.averageRating < filters.minRating) {
          return false;
        }
        
        if (filters.verificationTier && item.provider.verificationTier !== filters.verificationTier) {
          return false;
        }
        
        return true;
      });
    }
  }
}
