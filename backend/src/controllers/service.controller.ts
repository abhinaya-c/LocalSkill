import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ServiceRepository } from '../repositories/service.repository';
import { ProviderRepository } from '../repositories/provider.repository';
import { ServiceListingSchema } from 'shared';
import { AuditRepository } from '../repositories/audit.repository';

// Haversine formula for proximity calculations
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

export class ServiceController {
  static async createService(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const provider = await ProviderRepository.findByUserId(userId);
      if (!provider) {
        return res.status(403).json({ error: 'Only registered providers can list services.' });
      }

      const body = ServiceListingSchema.parse(req.body);
      const listing = await ServiceRepository.create({
        providerId: provider.id,
        ...body,
      });

      await AuditRepository.createLog({
        userId,
        action: 'SERVICE_CREATE',
        details: `Created listing: ${listing.title}`,
      });

      return res.status(201).json(listing);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateService(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const provider = await ProviderRepository.findByUserId(userId);
      const listing = await ServiceRepository.findById(id);

      if (!listing) {
        return res.status(404).json({ error: 'Service listing not found' });
      }

      if (!provider || listing.providerId !== provider.id) {
        return res.status(403).json({ error: 'You are not authorized to update this listing.' });
      }

      const updated = await ServiceRepository.update(id, req.body);

      await AuditRepository.createLog({
        userId,
        action: 'SERVICE_UPDATE',
        details: `Updated listing ID: ${id}`,
      });

      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async deleteService(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const provider = await ProviderRepository.findByUserId(userId);
      const listing = await ServiceRepository.findById(id);

      if (!listing) {
        return res.status(404).json({ error: 'Service listing not found' });
      }

      if (!provider || listing.providerId !== provider.id) {
        return res.status(403).json({ error: 'You are not authorized to delete this listing.' });
      }

      await ServiceRepository.delete(id);

      await AuditRepository.createLog({
        userId,
        action: 'SERVICE_DELETE',
        details: `Deleted listing ID: ${id}`,
      });

      return res.status(200).json({ success: true, message: 'Listing removed successfully.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getMyServices(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const provider = await ProviderRepository.findByUserId(userId);
      if (!provider) {
        return res.status(403).json({ error: 'Only providers can view their listings.' });
      }

      const listings = await ServiceRepository.listByProvider(provider.id);
      return res.status(200).json(listings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getServiceDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const listing = await ServiceRepository.findById(id);
      if (!listing) {
        return res.status(404).json({ error: 'Service listing not found' });
      }
      return res.status(200).json(listing);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async searchServices(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        keyword,
        category,
        minPrice,
        maxPrice,
        minRating,
        verificationTier,
        lat, // Customer Latitude
        lng, // Customer Longitude
      } = req.query;

      // Extract filter parameters
      const filters = {
        keyword: keyword ? String(keyword) : undefined,
        category: category ? String(category) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        verificationTier: verificationTier ? String(verificationTier) : undefined,
      };

      let listings = await ServiceRepository.searchAndFilter(filters);

      // Proximity Calculation & Sorting
      if (lat && lng) {
        const cLat = Number(lat);
        const cLng = Number(lng);

        listings = listings.map((l: any) => {
          let distance = null;
          if (l.provider && l.provider.latitude !== null && l.provider.longitude !== null) {
            distance = calculateDistanceKm(cLat, cLng, l.provider.latitude, l.provider.longitude);
          }
          return {
            ...l,
            distance: distance !== null ? Number(distance.toFixed(2)) : null,
          };
        });

        // Sort by distance (closest first), placing entries without distance at the end
        listings.sort((a: any, b: any) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }

      return res.status(200).json(listings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
