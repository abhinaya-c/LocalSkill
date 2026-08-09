export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type VerificationTier = 'UNVERIFIED' | 'BASIC' | 'VERIFIED';

export type PricingModel = 'HOURLY' | 'FIXED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  bio?: string;
  skills: string[];
  contactInfo?: string;
  verificationTier: VerificationTier;
  verificationDocs: string[];
  portfolio: string[];
  averageRating: number;
  reviewCount: number;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  title: string;
  category: string;
  description: string;
  pricingModel: PricingModel;
  price: number;
  isActive: boolean;
  createdAt: Date;
}

export interface AppointmentSlot {
  id: string;
  providerId: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  slotId: string;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  bookingId?: string;
  content: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}
