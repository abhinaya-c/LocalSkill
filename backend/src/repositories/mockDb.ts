import { User, ProviderProfile, ServiceListing, AppointmentSlot, Booking, Message, Review, Notification, AuditLog, UserRole, BookingStatus, VerificationTier, PricingModel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const hashedPassword = bcrypt.hashSync('password123', 10);

const JSON_FILE_PATH = path.join(__dirname, 'mockDbData.json');

export const mockUsers: any[] = [];
export const mockProviderProfiles: ProviderProfile[] = [];
export const mockServiceListings: ServiceListing[] = [];
export const mockAppointmentSlots: AppointmentSlot[] = [];
export const mockBookings: Booking[] = [];
export const mockReviews: Review[] = [];
export const mockMessages: Message[] = [];
export const mockNotifications: Notification[] = [];
export const mockAuditLogs: AuditLog[] = [];

const defaultUsers = [
  {
    id: 'admin-uuid-1111-2222-3333',
    name: 'Ram Bahadur',
    email: 'admin@localskill.com',
    phone: '+9779812345678',
    passwordHash: hashedPassword,
    role: UserRole.ADMIN,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    address: 'Mahendrapool, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'customer-uuid-1111-2222-3333',
    name: 'Sita Kumari',
    email: 'sita@localskill.com',
    phone: '+9779812345679',
    passwordHash: hashedPassword,
    role: UserRole.CUSTOMER,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    address: 'Lakeside Ward 6, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'provider-uuid-1111-2222-3333',
    name: 'Hari Shrestha',
    email: 'hari@localskill.com',
    phone: '+9779812345680',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    address: 'New Road, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'provider-uuid-4444-5555-6666',
    name: 'Gita Thapa',
    email: 'gita@localskill.com',
    phone: '+9779812345681',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    address: 'Sabhagriha Chowk, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'provider-uuid-carpentry-7777',
    name: 'Ramesh Vishwakarma',
    email: 'ramesh@carpentry.com',
    phone: '+9779812345682',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&q=80',
    address: 'Chipledhunga, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'provider-uuid-gardening-8888',
    name: 'Nabina Adhikari',
    email: 'nabina@gardening.com',
    phone: '+9779812345683',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    address: 'Lakeside Ward 8, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'provider-uuid-ac-9999',
    name: 'Sandeep Shrestha',
    email: 'sandeep@ac-heating.com',
    phone: '+9779812345684',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    address: 'Bagar, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // New Providers for Choice
  {
    id: 'provider-uuid-ram-1010',
    name: 'Ram Prasad Adhikari',
    email: 'ram@localskill.com',
    phone: '+9779812345685',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    address: 'Prithvi Chowk, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'provider-uuid-kiran-2020',
    name: 'Kiran Shrestha',
    email: 'kiran@localskill.com',
    phone: '+9779812345686',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    address: 'Bhimsen Tol, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'provider-uuid-niranjan-3030',
    name: 'Niranjan Thapa',
    email: 'niranjan@localskill.com',
    phone: '+9779812345687',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    address: 'Mahendrapool, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'provider-uuid-shyam-4040',
    name: 'Shyam Bahadur',
    email: 'shyam@carpentry.com',
    phone: '+9779812345688',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80',
    address: 'Lamachaur, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'provider-uuid-sunita-5050',
    name: 'Sunita Dahal',
    email: 'sunita@gardening.com',
    phone: '+9779812345689',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    address: 'Lakeside Ward 5, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'provider-uuid-anil-6060',
    name: 'Anil Thapa',
    email: 'anil@ac-heating.com',
    phone: '+9779812345690',
    passwordHash: hashedPassword,
    role: UserRole.PROVIDER,
    avatarUrl: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&w=150&q=80',
    address: 'Amarsingh Chowk, Pokhara',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultProviderProfiles: ProviderProfile[] = [
  {
    id: 'profile-uuid-john-1111',
    userId: 'provider-uuid-1111-2222-3333',
    bio: 'Pokhara-based licensed electrician with 8+ years of experience in residential wiring, appliance repair, and smart home setup.',
    skills: ['Electrical Wiring', 'Appliance Repair', 'Smart Home Installation', 'Lighting Design'],
    contactInfo: 'Hari Shrestha Electrical Services, New Road, Pokhara',
    verificationTier: VerificationTier.VERIFIED,
    verificationDocs: ['https://example.com/docs/hari_license.pdf'],
    portfolio: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1558223180-113b68c234a6?auto=format&fit=crop&w=600&q=80'
    ],
    latitude: 28.2096,
    longitude: 83.9856,
    averageRating: 4.8,
    reviewCount: 1,
  },
  {
    id: 'profile-uuid-jane-2222',
    userId: 'provider-uuid-4444-5555-6666',
    bio: 'Expert plumber in Kaski specializing in emergency leak repair, pipe installations, drain cleaning, and bathroom remodeling. Quick response time.',
    skills: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning', 'Water Heater Maintenance'],
    contactInfo: 'Gita Thapa Plumbing Services, Sabhagriha Chowk, Pokhara',
    verificationTier: VerificationTier.BASIC,
    verificationDocs: ['https://example.com/docs/gita_cert.pdf'],
    portfolio: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80'
    ],
    latitude: 28.2639,
    longitude: 83.9622,
    averageRating: 4.5,
    reviewCount: 4,
  },
  {
    id: 'profile-uuid-robert-3333',
    userId: 'provider-uuid-carpentry-7777',
    bio: 'Professional carpenter with 12 years of experience in custom wood carving, cabinet making, furniture restoration, and door installations in Pokhara valley.',
    skills: ['Cabinet Making', 'Furniture Repair', 'Framing', 'Custom Shelving', 'Deck building'],
    contactInfo: 'Ramesh Woodcraft Carpentry & Design, Chipledhunga, Pokhara',
    verificationTier: VerificationTier.VERIFIED,
    verificationDocs: ['https://example.com/docs/ramesh_license.pdf'],
    portfolio: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80'
    ],
    latitude: 28.2125,
    longitude: 83.9922,
    averageRating: 4.9,
    reviewCount: 14,
  },
  {
    id: 'profile-uuid-emily-4444',
    userId: 'provider-uuid-gardening-8888',
    bio: 'Landscape designer and gardener around Lakeside. Lawn care, weeding, pruning, custom garden design, organic pest control, and irrigation setup.',
    skills: ['Lawn Care', 'Garden Design', 'Pruning & Weeding', 'Pest Control', 'Irrigation Systems'],
    contactInfo: 'Nabina GreenSpace Landscaping, Lakeside Ward 8, Pokhara',
    verificationTier: VerificationTier.VERIFIED,
    verificationDocs: ['https://example.com/docs/nabina_cert.pdf'],
    portfolio: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'
    ],
    latitude: 28.2345,
    longitude: 83.9482,
    averageRating: 4.7,
    reviewCount: 8,
  },
  {
    id: 'profile-uuid-mark-5555',
    userId: 'provider-uuid-ac-9999',
    bio: 'Certified HVAC technician specializing in AC unit installation, duct cleaning, furnace maintenance, and emergency heating repairs in Bagar area.',
    skills: ['AC Installation', 'Duct Cleaning', 'Heating Repair', 'Thermostat Calibration'],
    contactInfo: 'Sandeep FreezePoint HVAC, Bagar, Pokhara',
    verificationTier: VerificationTier.BASIC,
    verificationDocs: ['https://example.com/docs/sandeep_hvac.pdf'],
    portfolio: [
      'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=600&q=80'
    ],
    latitude: 28.2198,
    longitude: 83.9744,
    averageRating: 4.6,
    reviewCount: 5,
  },
  // New Provider Profiles
  {
    id: 'profile-uuid-ram-1010',
    userId: 'provider-uuid-ram-1010',
    bio: 'Experienced local electrician with specialized knowledge in commercial board setups, three-phase wiring, and breaker fixes in Prithvi Chowk.',
    skills: ['Commercial Wiring', 'Breaker Panels', 'Generators', 'Three-phase Circuits'],
    contactInfo: 'Ram Prasad Electrical House, Prithvi Chowk, Pokhara',
    verificationTier: VerificationTier.BASIC,
    verificationDocs: ['https://example.com/docs/ram_docs.pdf'],
    portfolio: [],
    latitude: 28.2081,
    longitude: 83.9912,
    averageRating: 4.2,
    reviewCount: 6,
  },
  {
    id: 'profile-uuid-kiran-2020',
    userId: 'provider-uuid-kiran-2020',
    bio: 'Premium licensed plumber with 15+ years of experience in heavy commercial pipeline layout, water filtration systems, and custom bathroom fixtures.',
    skills: ['Water Filtration', 'Heavy Pipelines', 'Drainage Design', 'Emergency Leaks'],
    contactInfo: 'Kiran Shrestha Plumbing, Bhimsen Tol, Pokhara',
    verificationTier: VerificationTier.VERIFIED,
    verificationDocs: ['https://example.com/docs/kiran_license.pdf'],
    portfolio: [],
    latitude: 28.2255,
    longitude: 83.9801,
    averageRating: 4.9,
    reviewCount: 22,
  },
  {
    id: 'profile-uuid-niranjan-3030',
    userId: 'provider-uuid-niranjan-3030',
    bio: 'Smart home engineer certified in home automation setups, security configurations, high-end routing networks, and automated door systems.',
    skills: ['Smart Lighting', 'CCTV Setup', 'Home Network Design', 'Automated Locks'],
    contactInfo: 'Niranjan Smart Integrations, Mahendrapool, Pokhara',
    verificationTier: VerificationTier.VERIFIED,
    verificationDocs: ['https://example.com/docs/niranjan_cert.pdf'],
    portfolio: [],
    latitude: 28.2162,
    longitude: 83.9850,
    averageRating: 4.7,
    reviewCount: 11,
  },
  {
    id: 'profile-uuid-shyam-4040',
    userId: 'provider-uuid-shyam-4040',
    bio: 'Professional carpenter specializing in modular kitchen cabinets, custom office furniture, framing repairs, and wooden flooring.',
    skills: ['Modular Kitchens', 'Wooden Flooring', 'Office Furniture', 'Sanded Finishes'],
    contactInfo: 'Shyam woodcraft workshops, Lamachaur, Pokhara',
    verificationTier: VerificationTier.BASIC,
    verificationDocs: ['https://example.com/docs/shyam_docs.pdf'],
    portfolio: [],
    latitude: 28.2510,
    longitude: 83.9550,
    averageRating: 4.0,
    reviewCount: 3,
  },
  {
    id: 'profile-uuid-sunita-5050',
    userId: 'provider-uuid-sunita-5050',
    bio: 'Organic gardening expert specializing in rooftop farming, decorative flower gardens, vertical planters, and regular lawn maintenance.',
    skills: ['Rooftop Farming', 'Vertical Gardens', 'Flower Planting', 'Organic Fertilizers'],
    contactInfo: 'Sunita Nursery and Garden Service, Lakeside Ward 5, Pokhara',
    verificationTier: VerificationTier.BASIC,
    verificationDocs: ['https://example.com/docs/sunita_cert.pdf'],
    portfolio: [],
    latitude: 28.2110,
    longitude: 83.9510,
    averageRating: 4.4,
    reviewCount: 7,
  },
  {
    id: 'profile-uuid-anil-6060',
    userId: 'provider-uuid-anil-6060',
    bio: 'High-end licensed HVAC engineer specializing in central air installations, heavy cooling units, ventilation balance, and deep furnace repair.',
    skills: ['Central Air systems', 'Commercial HVAC', 'Ventilation Balance', 'Furnaces'],
    contactInfo: 'Anil Air Conditioning & Heating, Amarsingh Chowk, Pokhara',
    verificationTier: VerificationTier.VERIFIED,
    verificationDocs: ['https://example.com/docs/anil_license.pdf'],
    portfolio: [],
    latitude: 28.2045,
    longitude: 84.0040,
    averageRating: 4.9,
    reviewCount: 19,
  },
];

const defaultServiceListings: ServiceListing[] = [
  // Electrical
  {
    id: 'listing-uuid-john-1111',
    providerId: 'profile-uuid-john-1111',
    title: 'Residential Electrical Inspection & Repair',
    category: 'Electrical',
    description: 'Complete inspection of home wiring, fixing broken outlets, light switches, and circuit breaker troubleshooting. Quality guaranteed.',
    pricingModel: PricingModel.HOURLY,
    price: 500.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing-uuid-john-2222',
    providerId: 'profile-uuid-john-1111',
    title: 'Smart Home Hub and Device Installation',
    category: 'Smart Home',
    description: 'Setup and configuration of smart doorbells, thermostats, security cameras, and voice control hubs (Alexa/Google Home).',
    pricingModel: PricingModel.FIXED,
    price: 3500.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing-uuid-john-3333',
    providerId: 'profile-uuid-john-1111',
    title: 'Electrical Panel Upgrade & Load Balancing',
    category: 'Electrical',
    description: 'Full upgrade of outdated circuit breaker panels, load balancing for high-power appliances, and safety compliance checks. Ideal for homes adding AC units, EV chargers, or solar systems.',
    pricingModel: PricingModel.FIXED,
    price: 8500.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing-uuid-john-4444',
    providerId: 'profile-uuid-john-1111',
    title: 'Emergency Wiring Repair & Fault Detection',
    category: 'Electrical',
    description: 'Same-day emergency service for dangerous wiring faults, power outages, tripping breakers, and burning smells. Available 7 days a week across Pokhara.',
    pricingModel: PricingModel.HOURLY,
    price: 750.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing-uuid-ram-1111',
    providerId: 'profile-uuid-ram-1010',
    title: 'Commercial Board Setup & Backup Generator Check',
    category: 'Electrical',
    description: 'Comprehensive commercial electrical troubleshooting, power board assembly, backup generator connections, and high-load wiring.',
    pricingModel: PricingModel.FIXED,
    price: 4500.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Plumbing
  {
    id: 'listing-uuid-jane-1111',
    providerId: 'profile-uuid-jane-2222',
    title: 'Emergency Leak Detection and Pipe Repair',
    category: 'Plumbing',
    description: 'Professional leak detection using modern tools and instant pipe repairs to prevent water damage in your house.',
    pricingModel: PricingModel.HOURLY,
    price: 600.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing-uuid-kiran-1111',
    providerId: 'profile-uuid-kiran-2020',
    title: 'Complete Bathroom Plumbing & Filter Setups',
    category: 'Plumbing',
    description: 'Heavy duty plumbing, water filter fittings, new bathroom pipe layouts, and custom high-pressure system installation.',
    pricingModel: PricingModel.FIXED,
    price: 8000.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Smart Home
  {
    id: 'listing-uuid-niranjan-1111',
    providerId: 'profile-uuid-niranjan-3030',
    title: 'Premium CCTV & Smart Security Camera Setup',
    category: 'Smart Home',
    description: 'Setup of wireless security cameras, video recording storage sync, automated motion alarm notifications, and mobile app pairing.',
    pricingModel: PricingModel.FIXED,
    price: 5000.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Carpentry
  {
    id: 'listing-uuid-robert-1111',
    providerId: 'profile-uuid-robert-3333',
    title: 'Custom Furniture Restoration & Repairs',
    category: 'Carpentry',
    description: 'Breathe new life into your wooden furniture. I fix wobbly chairs, scratch repairs, table refinishing, and complete cabinet assemblies.',
    pricingModel: PricingModel.FIXED,
    price: 2500.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing-uuid-shyam-1111',
    providerId: 'profile-uuid-shyam-4040',
    title: 'Modular Kitchen Cabinets & Wood Sanding',
    category: 'Carpentry',
    description: 'Clean modern layout setups for kitchen storage, cabinet board repairs, door hinges tuning, and clean varnish finishes.',
    pricingModel: PricingModel.HOURLY,
    price: 450.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Gardening
  {
    id: 'listing-uuid-emily-1111',
    providerId: 'profile-uuid-emily-4444',
    title: 'Weekly Lawn Care & Garden Maintenance',
    category: 'Gardening',
    description: 'Keep your garden beautiful. Weekly services include grass cutting, flower pruning, weeding, soil fertilization, and hedge trimming.',
    pricingModel: PricingModel.HOURLY,
    price: 400.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing-uuid-sunita-1111',
    providerId: 'profile-uuid-sunita-5050',
    title: 'Rooftop Organic Farm Design & Plant Bedding',
    category: 'Gardening',
    description: 'Setup organic vertical plant grids, premium soil mixtures, plant seasonal vegetables, and irrigation layouts on rooftops.',
    pricingModel: PricingModel.FIXED,
    price: 3000.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // AC & Heating
  {
    id: 'listing-uuid-mark-1111',
    providerId: 'profile-uuid-mark-5555',
    title: 'AC Maintenance & Deep Duct Cleaning',
    category: 'AC & Heating',
    description: 'Ensure clean air and optimal cooling. We perform deep cleaning of vents, filters, duct systems, and check refrigerant levels.',
    pricingModel: PricingModel.FIXED,
    price: 2000.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing-uuid-anil-1111',
    providerId: 'profile-uuid-anil-6060',
    title: 'High-end Central AC System Installations',
    category: 'AC & Heating',
    description: 'Professional setup for multi-room central air conditioning, outdoor compressor fittings, high-efficiency cooling, and ducting checks.',
    pricingModel: PricingModel.FIXED,
    price: 15000.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const today = new Date();
const defaultAppointmentSlots: AppointmentSlot[] = [
  {
    id: 'slot-uuid-john-booked',
    providerId: 'profile-uuid-john-1111',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0),
    isBooked: true,
  },
  {
    id: 'slot-uuid-john-free-1',
    providerId: 'profile-uuid-john-1111',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 13, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0),
    isBooked: false,
  },
  {
    id: 'slot-uuid-john-free-2',
    providerId: 'profile-uuid-john-1111',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12, 0),
    isBooked: false,
  },
  {
    id: 'slot-uuid-john-free-3',
    providerId: 'profile-uuid-john-1111',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0),
    isBooked: false,
  },
  {
    id: 'slot-uuid-john-free-4',
    providerId: 'profile-uuid-john-1111',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 9, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 0),
    isBooked: false,
  },
  {
    id: 'slot-uuid-john-free-5',
    providerId: 'profile-uuid-john-1111',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 13, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 15, 0),
    isBooked: false,
  },
  {
    id: 'slot-uuid-john-free-6',
    providerId: 'profile-uuid-john-1111',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 10, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 12, 0),
    isBooked: false,
  },
  {
    id: 'slot-uuid-jane-free-1',
    providerId: 'profile-uuid-jane-2222',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
    isBooked: false,
  },
  {
    id: 'slot-uuid-jane-free-2',
    providerId: 'profile-uuid-jane-2222',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0),
    isBooked: false,
  },
  // Add some free slots for other providers
  {
    id: 'slot-uuid-kiran-free-1',
    providerId: 'profile-uuid-kiran-2020',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0),
    isBooked: false,
  },
  {
    id: 'slot-uuid-niranjan-free-1',
    providerId: 'profile-uuid-niranjan-3030',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 0),
    isBooked: false,
  },
  {
    id: 'slot-uuid-anil-free-1',
    providerId: 'profile-uuid-anil-6060',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
    isBooked: false,
  },
];

const defaultBookings: Booking[] = [
  {
    id: 'booking-uuid-alice-john',
    customerId: 'customer-uuid-1111-2222-3333',
    providerId: 'profile-uuid-john-1111',
    serviceId: 'listing-uuid-john-1111',
    slotId: 'slot-uuid-john-booked',
    status: BookingStatus.COMPLETED,
    notes: 'Please check the light fixture in the kitchen, it flickers constantly. Located at Lakeside Ward 6, Pokhara.',
    createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000),
  },
];

const defaultReviews: Review[] = [
  {
    id: 'review-uuid-1111',
    bookingId: 'booking-uuid-alice-john',
    customerId: 'customer-uuid-1111-2222-3333',
    providerId: 'profile-uuid-john-1111',
    rating: 5.0,
    comment: 'Hari Shrestha was extremely professional and fixed the flickering light in minutes! Highly recommend his electrical services in Pokhara.',
    createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000),
  },
];

const defaultMessages: Message[] = [
  {
    id: 'msg-uuid-1111',
    senderId: 'customer-uuid-1111-2222-3333',
    receiverId: 'provider-uuid-1111-2222-3333',
    bookingId: 'booking-uuid-alice-john',
    content: 'Hi Hari, are you still on track for our appointment tomorrow?',
    createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-uuid-2222',
    senderId: 'provider-uuid-1111-2222-3333',
    receiverId: 'customer-uuid-1111-2222-3333',
    bookingId: 'booking-uuid-alice-john',
    content: 'Hello Sita, yes! I will be there at 9 AM sharp. See you tomorrow.',
    createdAt: new Date(today.getTime() - 23.5 * 60 * 60 * 1000),
  },
];

const defaultNotifications: Notification[] = [
  {
    id: 'notify-uuid-1111',
    userId: 'customer-uuid-1111-2222-3333',
    title: 'Booking Completed',
    content: 'Your booking for "Residential Electrical Inspection & Repair" has been marked complete. Please leave a review!',
    type: 'BOOKING',
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: 'notify-uuid-2222',
    userId: 'provider-uuid-1111-2222-3333',
    title: 'New Review Received',
    content: 'Sita Kumari left you a 5-star review!',
    type: 'REVIEW',
    isRead: true,
    createdAt: new Date(),
  },
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: 'audit-uuid-1111',
    userId: 'admin-uuid-1111-2222-3333',
    action: 'USER_LOGIN',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    details: 'Admin logged in successfully.',
    createdAt: new Date(),
  },
];

// Recursive helper to convert ISO strings back to Date objects
function reviveDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = reviveDates(obj[key]);
      }
    }
  }
  return obj;
}

export function saveDb() {
  try {
    const data = {
      users: mockUsers,
      providerProfiles: mockProviderProfiles,
      serviceListings: mockServiceListings,
      appointmentSlots: mockAppointmentSlots,
      bookings: mockBookings,
      reviews: mockReviews,
      messages: mockMessages,
      notifications: mockNotifications,
      auditLogs: mockAuditLogs,
    };
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing mockDb.json:', e);
  }
}

function loadDb() {
  if (fs.existsSync(JSON_FILE_PATH)) {
    try {
      const data = reviveDates(JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8')));

      // Merge users — always include new default users not yet in JSON
      const existingUserIds = new Set((data.users || []).map((u: any) => u.id));
      const newDefaultUsers = defaultUsers.filter(u => !existingUserIds.has(u.id));
      mockUsers.push(...(data.users || []), ...newDefaultUsers);

      // Merge provider profiles — always include new defaults
      const existingProfileIds = new Set((data.providerProfiles || []).map((p: any) => p.id));
      const newDefaultProfiles = defaultProviderProfiles.filter(p => !existingProfileIds.has(p.id));
      mockProviderProfiles.push(...(data.providerProfiles || []), ...newDefaultProfiles);

      // Always merge default service listings (so newly seeded services appear)
      const existingListingIds = new Set((data.serviceListings || []).map((s: any) => s.id));
      const newDefaultListings = defaultServiceListings.filter(s => !existingListingIds.has(s.id));
      mockServiceListings.push(...(data.serviceListings || []), ...newDefaultListings);

      // Always merge default appointment slots (so newly seeded slots appear)
      const existingSlotIds = new Set((data.appointmentSlots || []).map((s: any) => s.id));
      const newDefaultSlots = defaultAppointmentSlots.filter(s => !existingSlotIds.has(s.id));
      mockAppointmentSlots.push(...(data.appointmentSlots || []), ...newDefaultSlots);

      // Merge bookings — preserve persisted + seed defaults
      const existingBookingIds = new Set((data.bookings || []).map((b: any) => b.id));
      const newDefaultBookings = defaultBookings.filter(b => !existingBookingIds.has(b.id));
      mockBookings.push(...(data.bookings || []), ...newDefaultBookings);

      // Merge reviews — preserve persisted + seed defaults
      const existingReviewIds = new Set((data.reviews || []).map((r: any) => r.id));
      const newDefaultReviews = defaultReviews.filter(r => !existingReviewIds.has(r.id));
      mockReviews.push(...(data.reviews || []), ...newDefaultReviews);

      // Merge messages — preserve chat history + seed defaults
      const existingMessageIds = new Set((data.messages || []).map((m: any) => m.id));
      const newDefaultMessages = defaultMessages.filter(m => !existingMessageIds.has(m.id));
      mockMessages.push(...(data.messages || []), ...newDefaultMessages);

      // Merge notifications
      const existingNotifyIds = new Set((data.notifications || []).map((n: any) => n.id));
      const newDefaultNotifications = defaultNotifications.filter(n => !existingNotifyIds.has(n.id));
      mockNotifications.push(...(data.notifications || []), ...newDefaultNotifications);

      // Merge audit logs
      const existingAuditIds = new Set((data.auditLogs || []).map((a: any) => a.id));
      const newDefaultAuditLogs = defaultAuditLogs.filter(a => !existingAuditIds.has(a.id));
      mockAuditLogs.push(...(data.auditLogs || []), ...newDefaultAuditLogs);

      return;
    } catch (e) {
      console.error('Error loading mockDb.json:', e);
    }
  }

  // Load defaults (first boot — no JSON file yet)
  mockUsers.push(...defaultUsers);
  mockProviderProfiles.push(...defaultProviderProfiles);
  mockServiceListings.push(...defaultServiceListings);
  mockAppointmentSlots.push(...defaultAppointmentSlots);
  mockBookings.push(...defaultBookings);
  mockReviews.push(...defaultReviews);
  mockMessages.push(...defaultMessages);
  mockNotifications.push(...defaultNotifications);
  mockAuditLogs.push(...defaultAuditLogs);
  saveDb();
}

loadDb();

// Periodically sync to file
setInterval(saveDb, 1000);

process.on('SIGINT', () => {
  saveDb();
  process.exit(0);
});
process.on('SIGTERM', () => {
  saveDb();
  process.exit(0);
});
