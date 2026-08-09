import { PrismaClient, UserRole, BookingStatus, VerificationTier, PricingModel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const today = new Date();

  // Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.appointmentSlot.deleteMany({});
  await prisma.serviceListing.deleteMany({});
  await prisma.providerProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Ram Bahadur',
      email: 'admin@localskill.com',
      phone: '+9779812345678',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      address: 'Mahendrapool, Pokhara',
    } as any,
  });
  console.log(`Created admin: ${admin.email}`);

  // 2. Create Customer
  const customer = await prisma.user.create({
    data: {
      name: 'Sita Kumari',
      email: 'sita@localskill.com',
      phone: '+9779812345679',
      passwordHash: hashedPassword,
      role: UserRole.CUSTOMER,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      address: 'Lakeside Ward 6, Pokhara',
    } as any,
  });
  console.log(`Created customer: ${customer.email}`);

  // Helpers to create user, profile, listing, slots
  const providersList = [
    {
      email: 'hari@localskill.com',
      name: 'Hari Shrestha',
      phone: '+9779812345680',
      address: 'New Road, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      bio: 'Pokhara-based licensed electrician with 8+ years of experience in residential wiring, appliance repair, and smart home setup.',
      skills: ['Electrical Wiring', 'Appliance Repair', 'Smart Home Installation', 'Lighting Design'],
      contactInfo: 'Hari Shrestha Electrical Services, New Road, Pokhara',
      tier: VerificationTier.VERIFIED,
      docs: ['https://example.com/docs/hari_license.pdf'],
      lat: 28.2096,
      lng: 83.9856,
      rating: 4.8,
      reviews: 1,
      listings: [
        { title: 'Residential Electrical Inspection & Repair', category: 'Electrical', desc: 'Complete inspection of home wiring, fixing broken outlets, light switches, and circuit breaker troubleshooting. Quality guaranteed.', model: PricingModel.HOURLY, price: 500 },
        { title: 'Smart Home Hub and Device Installation', category: 'Smart Home', desc: 'Setup and configuration of smart doorbells, thermostats, security cameras, and voice control hubs (Alexa/Google Home).', model: PricingModel.FIXED, price: 3500 }
      ]
    },
    {
      email: 'gita@localskill.com',
      name: 'Gita Thapa',
      phone: '+9779812345681',
      address: 'Sabhagriha Chowk, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      bio: 'Expert plumber in Kaski specializing in emergency leak repair, pipe installations, drain cleaning, and bathroom remodeling. Quick response time.',
      skills: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning', 'Water Heater Maintenance'],
      contactInfo: 'Gita Thapa Plumbing Services, Sabhagriha Chowk, Pokhara',
      tier: VerificationTier.BASIC,
      docs: ['https://example.com/docs/gita_cert.pdf'],
      lat: 28.2639,
      lng: 83.9622,
      rating: 4.5,
      reviews: 4,
      listings: [
        { title: 'Emergency Leak Detection and Pipe Repair', category: 'Plumbing', desc: 'Professional leak detection using modern tools and instant pipe repairs to prevent water damage in your house.', model: PricingModel.HOURLY, price: 600 }
      ]
    },
    {
      email: 'ramesh@carpentry.com',
      name: 'Ramesh Vishwakarma',
      phone: '+9779812345682',
      address: 'Chipledhunga, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&q=80',
      bio: 'Professional carpenter with 12 years of experience in custom wood carving, furniture restoration, and door installations in Pokhara valley.',
      skills: ['Cabinet Making', 'Furniture Repair', 'Framing', 'Custom Shelving'],
      contactInfo: 'Ramesh Woodcraft Carpentry & Design, Chipledhunga, Pokhara',
      tier: VerificationTier.VERIFIED,
      docs: ['https://example.com/docs/ramesh_license.pdf'],
      lat: 28.2125,
      lng: 83.9922,
      rating: 4.9,
      reviews: 14,
      listings: [
        { title: 'Custom Furniture Restoration & Repairs', category: 'Carpentry', desc: 'Breathe new life into your wooden furniture. I fix wobbly chairs, scratch repairs, table refinishing, and complete cabinet assemblies.', model: PricingModel.FIXED, price: 2500 }
      ]
    },
    {
      email: 'nabina@gardening.com',
      name: 'Nabina Adhikari',
      phone: '+9779812345683',
      address: 'Lakeside Ward 8, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      bio: 'Landscape designer and gardener around Lakeside. Lawn care, weeding, pruning, custom garden design, organic pest control, and irrigation setup.',
      skills: ['Lawn Care', 'Garden Design', 'Pruning & Weeding'],
      contactInfo: 'Nabina GreenSpace Landscaping, Lakeside Ward 8, Pokhara',
      tier: VerificationTier.VERIFIED,
      docs: ['https://example.com/docs/nabina_cert.pdf'],
      lat: 28.2345,
      lng: 83.9482,
      rating: 4.7,
      reviews: 8,
      listings: [
        { title: 'Weekly Lawn Care & Garden Maintenance', category: 'Gardening', desc: 'Keep your garden beautiful. Weekly services include grass cutting, flower pruning, weeding, soil fertilization, and hedge trimming.', model: PricingModel.HOURLY, price: 400 }
      ]
    },
    {
      email: 'sandeep@ac-heating.com',
      name: 'Sandeep Shrestha',
      phone: '+9779812345684',
      address: 'Bagar, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      bio: 'Certified HVAC technician specializing in AC unit installation, duct cleaning, furnace maintenance, and emergency heating repairs in Bagar area.',
      skills: ['AC Installation', 'Duct Cleaning', 'Heating Repair'],
      contactInfo: 'Sandeep FreezePoint HVAC, Bagar, Pokhara',
      tier: VerificationTier.BASIC,
      docs: ['https://example.com/docs/sandeep_hvac.pdf'],
      lat: 28.2198,
      lng: 83.9744,
      rating: 4.6,
      reviews: 5,
      listings: [
        { title: 'AC Maintenance & Deep Duct Cleaning', category: 'AC & Heating', desc: 'Ensure clean air and optimal cooling. We perform deep cleaning of vents, filters, duct systems, and check refrigerant levels.', model: PricingModel.FIXED, price: 2000 }
      ]
    },
    // Extra Choice Options
    {
      email: 'ram@localskill.com',
      name: 'Ram Prasad Adhikari',
      phone: '+9779812345685',
      address: 'Prithvi Chowk, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
      bio: 'Experienced local electrician with specialized knowledge in commercial board setups, three-phase wiring, and breaker fixes in Prithvi Chowk.',
      skills: ['Commercial Wiring', 'Breaker Panels', 'Generators'],
      contactInfo: 'Ram Prasad Electrical House, Prithvi Chowk, Pokhara',
      tier: VerificationTier.BASIC,
      docs: ['https://example.com/docs/ram_docs.pdf'],
      lat: 28.2081,
      lng: 83.9912,
      rating: 4.2,
      reviews: 6,
      listings: [
        { title: 'Commercial Board Setup & Backup Generator Check', category: 'Electrical', desc: 'Comprehensive commercial electrical troubleshooting, power board assembly, backup generator connections, and high-load wiring.', model: PricingModel.FIXED, price: 4500 }
      ]
    },
    {
      email: 'kiran@localskill.com',
      name: 'Kiran Shrestha',
      phone: '+9779812345686',
      address: 'Bhimsen Tol, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      bio: 'Premium licensed plumber with 15+ years of experience in heavy commercial pipeline layout, water filtration systems, and custom bathroom fixtures.',
      skills: ['Water Filtration', 'Heavy Pipelines', 'Drainage Design'],
      contactInfo: 'Kiran Shrestha Plumbing, Bhimsen Tol, Pokhara',
      tier: VerificationTier.VERIFIED,
      docs: ['https://example.com/docs/kiran_license.pdf'],
      lat: 28.2255,
      lng: 83.9801,
      rating: 4.9,
      reviews: 22,
      listings: [
        { title: 'Complete Bathroom Plumbing & Filter Setups', category: 'Plumbing', desc: 'Heavy duty plumbing, water filter fittings, new bathroom pipe layouts, and custom high-pressure system installation.', model: PricingModel.FIXED, price: 8000 }
      ]
    },
    {
      email: 'niranjan@localskill.com',
      name: 'Niranjan Thapa',
      phone: '+9779812345687',
      address: 'Mahendrapool, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
      bio: 'Smart home engineer certified in home automation setups, security configurations, high-end routing networks, and automated door systems.',
      skills: ['Smart Lighting', 'CCTV Setup', 'Home Network Design'],
      contactInfo: 'Niranjan Smart Integrations, Mahendrapool, Pokhara',
      tier: VerificationTier.VERIFIED,
      docs: ['https://example.com/docs/niranjan_cert.pdf'],
      lat: 28.2162,
      lng: 83.9850,
      rating: 4.7,
      reviews: 11,
      listings: [
        { title: 'Premium CCTV & Smart Security Camera Setup', category: 'Smart Home', desc: 'Setup of wireless security cameras, video recording storage sync, automated motion alarm notifications, and mobile app pairing.', model: PricingModel.FIXED, price: 5000 }
      ]
    },
    {
      email: 'shyam@carpentry.com',
      name: 'Shyam Bahadur',
      phone: '+9779812345688',
      address: 'Lamachaur, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80',
      bio: 'Professional carpenter specializing in modular kitchen cabinets, custom office furniture, framing repairs, and wooden flooring.',
      skills: ['Modular Kitchens', 'Wooden Flooring', 'Office Furniture'],
      contactInfo: 'Shyam woodcraft workshops, Lamachaur, Pokhara',
      tier: VerificationTier.BASIC,
      docs: ['https://example.com/docs/shyam_docs.pdf'],
      lat: 28.2510,
      lng: 83.9550,
      rating: 4.0,
      reviews: 3,
      listings: [
        { title: 'Modular Kitchen Cabinets & Wood Sanding', category: 'Carpentry', desc: 'Clean modern layout setups for kitchen storage, cabinet board repairs, door hinges tuning, and clean varnish finishes.', model: PricingModel.HOURLY, price: 450 }
      ]
    },
    {
      email: 'sunita@gardening.com',
      name: 'Sunita Dahal',
      phone: '+9779812345689',
      address: 'Lakeside Ward 5, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      bio: 'Organic gardening expert specializing in rooftop farming, decorative flower gardens, vertical planters, and regular lawn maintenance.',
      skills: ['Rooftop Farming', 'Vertical Gardens', 'Flower Planting'],
      contactInfo: 'Sunita Nursery and Garden Service, Lakeside Ward 5, Pokhara',
      tier: VerificationTier.BASIC,
      docs: ['https://example.com/docs/sunita_cert.pdf'],
      lat: 28.2110,
      lng: 83.9510,
      rating: 4.4,
      reviews: 7,
      listings: [
        { title: 'Rooftop Organic Farm Design & Plant Bedding', category: 'Gardening', desc: 'Setup organic vertical plant grids, premium soil mixtures, plant seasonal vegetables, and irrigation layouts on rooftops.', model: PricingModel.FIXED, price: 3000 }
      ]
    },
    {
      email: 'anil@ac-heating.com',
      name: 'Anil Thapa',
      phone: '+9779812345690',
      address: 'Amarsingh Chowk, Pokhara',
      avatarUrl: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&w=150&q=80',
      bio: 'High-end licensed HVAC engineer specializing in central air installations, heavy cooling units, ventilation balance, and deep furnace repair.',
      skills: ['Central Air systems', 'Commercial HVAC', 'Ventilation Balance'],
      contactInfo: 'Anil Air Conditioning & Heating, Amarsingh Chowk, Pokhara',
      tier: VerificationTier.VERIFIED,
      docs: ['https://example.com/docs/anil_license.pdf'],
      lat: 28.2045,
      lng: 84.0040,
      rating: 4.9,
      reviews: 19,
      listings: [
        { title: 'High-end Central AC System Installations', category: 'AC & Heating', desc: 'Professional setup for multi-room central air conditioning, outdoor compressor fittings, high-efficiency cooling, and ducting checks.', model: PricingModel.FIXED, price: 15000 }
      ]
    }
  ];

  const firstProviderSlots: any[] = [];
  const createdProfilesMap: Record<string, string> = {};

  for (const prov of providersList) {
    const user = await prisma.user.create({
      data: {
        name: prov.name,
        email: prov.email,
        phone: prov.phone,
        passwordHash: hashedPassword,
        role: UserRole.PROVIDER,
        avatarUrl: prov.avatarUrl,
        address: prov.address,
      } as any
    });

    const profile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        bio: prov.bio,
        skills: prov.skills,
        contactInfo: prov.contactInfo,
        verificationTier: prov.tier,
        verificationDocs: prov.docs,
        latitude: prov.lat,
        longitude: prov.lng,
        averageRating: prov.rating,
        reviewCount: prov.reviews,
      }
    });

    createdProfilesMap[prov.email] = profile.id;

    for (const list of prov.listings) {
      await prisma.serviceListing.create({
        data: {
          providerId: profile.id,
          title: list.title,
          category: list.category,
          description: list.desc,
          pricingModel: list.model,
          price: list.price,
          isActive: true,
        }
      });
    }

    // Add slots
    const today = new Date();
    const slot1 = await prisma.appointmentSlot.create({
      data: {
        providerId: profile.id,
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0),
        isBooked: prov.email === 'hari@localskill.com', // Book the first slot for Hari
      }
    });
    
    await prisma.appointmentSlot.create({
      data: {
        providerId: profile.id,
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 13, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0),
        isBooked: false,
      }
    });

    if (prov.email === 'hari@localskill.com') {
      firstProviderSlots.push(slot1);
    }
  }

  // Find Sita Kumari
  const sita = await prisma.user.findFirst({ where: { email: 'sita@localskill.com' } });
  const hariProfileId = createdProfilesMap['hari@localskill.com'];
  const hariUser = await prisma.user.findFirst({ where: { email: 'hari@localskill.com' } });
  const electricalListing = await prisma.serviceListing.findFirst({ where: { providerId: hariProfileId, category: 'Electrical' } });

  if (sita && hariProfileId && electricalListing && firstProviderSlots.length > 0 && hariUser) {
    // Create booking between Sita and John
    const booking = await prisma.booking.create({
      data: {
        customerId: sita.id,
        providerId: hariProfileId,
        serviceId: electricalListing.id,
        slotId: firstProviderSlots[0].id,
        status: BookingStatus.COMPLETED,
        notes: 'Please check the light fixture in the kitchen, it flickers constantly. Located at Lakeside Ward 6, Pokhara.',
      },
    });

    // Create review for John
    await prisma.review.create({
      data: {
        bookingId: booking.id,
        customerId: sita.id,
        providerId: hariProfileId,
        rating: 5.0,
        comment: 'John was extremely professional and fixed the flickering light in minutes! Highly recommend his electrical services in Pokhara.',
      },
    });

    // Create a chat history
    await prisma.message.createMany({
      data: [
        {
          senderId: sita.id,
          receiverId: hariUser.id,
          bookingId: booking.id,
          content: 'Hi John, are you still on track for our appointment tomorrow?',
          createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        },
        {
          senderId: hariUser.id,
          receiverId: sita.id,
          bookingId: booking.id,
          content: 'Hello Sita, yes! I will be there at 9 AM sharp. See you tomorrow.',
          createdAt: new Date(today.getTime() - 23.5 * 60 * 60 * 1000),
        },
      ],
    });

    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: sita.id,
          title: 'Booking Completed',
          content: 'Your booking for "Residential Electrical Inspection & Repair" has been marked complete. Please leave a review!',
          type: 'BOOKING',
        },
        {
          userId: hariUser.id,
          title: 'New Review Received',
          content: 'Sita Kumari left you a 5-star review!',
          type: 'REVIEW',
        },
      ],
    });
  }

  // Create security audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'USER_LOGIN',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        details: 'Admin logged in successfully.',
      },
    ],
  });

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
