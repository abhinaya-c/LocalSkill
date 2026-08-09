import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'PROVIDER']),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const PasswordResetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const ProviderProfileSchema = z.object({
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  contactInfo: z.string().optional(),
  portfolio: z.array(z.string()).optional(),
  verificationDocs: z.array(z.string()).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const ServiceListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  pricingModel: z.enum(['HOURLY', 'FIXED']),
  price: z.number().positive('Price must be greater than zero'),
});

export const BookingSchema = z.object({
  serviceId: z.string().min(1, 'Invalid Service ID'),
  slotId: z.string().min(1, 'Invalid Slot ID'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const ReviewSchema = z.object({
  bookingId: z.string().min(1, 'Invalid Booking ID'),
  rating: z.number().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5'),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

export const MessageSchema = z.object({
  receiverId: z.string().min(1, 'Invalid Receiver ID'),
  bookingId: z.string().min(1, 'Invalid Booking ID').optional(),
  content: z.string().min(1, 'Message content cannot be empty').max(2000, 'Message too long'),
});
