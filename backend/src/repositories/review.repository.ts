import { prisma } from '../config/db';

const hasDatabase = !!process.env.DATABASE_URL;
const getMockDb = () => require('./mockDb');

export class ReviewRepository {
  static async checkDuplicateReview(bookingId: string) {
    if (hasDatabase) {
      const review = await prisma.review.findUnique({
        where: { bookingId },
      });
      return !!review;
    } else {
      return getMockDb().mockReviews.some((r: any) => r.bookingId === bookingId);
    }
  }

  static async createReview(data: {
    bookingId: string;
    customerId: string;
    providerId: string;
    rating: number;
    comment?: string;
  }) {
    if (hasDatabase) {
      return prisma.$transaction(async (tx) => {
        // Create review
        const review = await tx.review.create({
          data,
        });

        // Recalculate average rating for provider
        const aggregates = await tx.review.aggregate({
          where: { providerId: data.providerId },
          _avg: { rating: true },
          _count: { id: true },
        });

        // Update provider profile
        await tx.providerProfile.update({
          where: { id: data.providerId },
          data: {
            averageRating: aggregates._avg.rating || 0.0,
            reviewCount: aggregates._count.id || 0,
          },
        });

        return review;
      });
    } else {
      const newReview = {
        id: `review-uuid-${Math.random().toString(36).substr(2, 9)}`,
        bookingId: data.bookingId,
        customerId: data.customerId,
        providerId: data.providerId,
        rating: data.rating,
        comment: data.comment || null,
        createdAt: new Date(),
      };
      getMockDb().mockReviews.push(newReview);

      // Update provider profile avg in mock db
      const providerIdx = getMockDb().mockProviderProfiles.findIndex((p: any) => p.id === data.providerId);
      if (providerIdx !== -1) {
        const providerReviews = getMockDb().mockReviews.filter((r: any) => r.providerId === data.providerId);
        const sum = providerReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        
        getMockDb().mockProviderProfiles[providerIdx].averageRating = Number((sum / providerReviews.length).toFixed(2));
        getMockDb().mockProviderProfiles[providerIdx].reviewCount = providerReviews.length;
      }

      return newReview;
    }
  }

  static async listByProvider(providerId: string) {
    if (hasDatabase) {
      return prisma.review.findMany({
        where: { providerId },
        include: {
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return getMockDb().mockReviews
        .filter((r: any) => r.providerId === providerId)
        .map((r: any) => {
          const customer = getMockDb().mockUsers.find((u: any) => u.id === r.customerId);
          return {
            ...r,
            customer,
          };
        });
    }
  }
}

