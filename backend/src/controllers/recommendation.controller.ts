import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ProviderRepository } from '../repositories/provider.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { ServiceRepository } from '../repositories/service.repository';

// Proximity distance formula
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class RecommendationController {
  static async getRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { lat, lng } = req.query;

      // 1. Fetch customer bookings to determine preferred categories
      const bookings = await BookingRepository.listByCustomer(userId);
      const preferredCategories = new Map<string, number>();

      for (const b of bookings) {
        if (b.service && b.service.category) {
          const count = preferredCategories.get(b.service.category) || 0;
          preferredCategories.set(b.service.category, count + 1);
        }
      }

      // 2. Fetch all providers and listings
      const providers = await ProviderRepository.listAll();
      const scoredProviders: any[] = [];

      for (const p of providers) {
        let score = 0;

        // A. Rating Score (up to 50 points)
        score += p.averageRating * 10;

        // B. Verification Score (up to 20 points)
        if (p.verificationTier === 'VERIFIED') score += 20;
        else if (p.verificationTier === 'BASIC') score += 10;

        // C. Category Match Score (up to 30 points)
        // If provider lists services in the customer's booking history
        const listings = await ServiceRepository.listByProvider(p.id);
        let hasPreferredCategory = false;
        
        for (const l of listings) {
          if (preferredCategories.has(l.category)) {
            hasPreferredCategory = true;
            score += 15 * (preferredCategories.get(l.category) || 1); // Boost based on booking frequency
          }
        }

        // Limit category match boost to 30
        if (hasPreferredCategory && score > 150) {
          score = 150;
        }

        // D. Proximity Score (up to 40 points)
        let distance = null;
        if (lat && lng && p.latitude !== null && p.longitude !== null) {
          distance = getDistanceKm(Number(lat), Number(lng), p.latitude, p.longitude);
          if (distance <= 10) {
            score += 40; // High proximity boost
          } else if (distance <= 25) {
            score += 20; // Medium proximity boost
          }
        }

        scoredProviders.push({
          provider: {
            id: p.id,
            userId: p.userId,
            bio: p.bio,
            skills: p.skills,
            contactInfo: p.contactInfo,
            verificationTier: p.verificationTier,
            portfolio: p.portfolio,
            averageRating: p.averageRating,
            reviewCount: p.reviewCount,
            latitude: p.latitude,
            longitude: p.longitude,
            user: p.user ? {
              name: p.user.name,
              email: p.user.email,
              avatarUrl: p.user.avatarUrl,
            } : null,
          },
          score,
          distance: distance !== null ? Number(distance.toFixed(2)) : null,
          listings,
        });
      }

      // Sort by score descending
      scoredProviders.sort((a, b) => b.score - a.score);

      // Return top 6 recommendations
      return res.status(200).json(scoredProviders.slice(0, 6));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
