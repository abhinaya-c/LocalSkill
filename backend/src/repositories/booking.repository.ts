import { prisma } from '../config/db';
import { BookingStatus } from 'shared';

const hasDatabase = !!process.env.DATABASE_URL;
const getMockDb = () => require('./mockDb');

export class BookingRepository {
  // Appointment Slot methods
  static async createSlot(data: {
    providerId: string;
    startTime: Date;
    endTime: Date;
  }) {
    if (hasDatabase) {
      return prisma.appointmentSlot.create({
        data,
      });
    } else {
      const newSlot = {
        id: `slot-uuid-${Math.random().toString(36).substr(2, 9)}`,
        providerId: data.providerId,
        startTime: data.startTime,
        endTime: data.endTime,
        isBooked: false,
      };
      getMockDb().mockAppointmentSlots.push(newSlot);
      return newSlot;
    }
  }

  static async findSlotById(id: string) {
    if (hasDatabase) {
      return prisma.appointmentSlot.findUnique({
        where: { id },
      });
    } else {
      return getMockDb().mockAppointmentSlots.find((s: any) => s.id === id) || null;
    }
  }

  static async updateSlotBookingStatus(slotId: string, isBooked: boolean) {
    if (hasDatabase) {
      return prisma.appointmentSlot.update({
        where: { id: slotId },
        data: { isBooked },
      });
    } else {
      const index = getMockDb().mockAppointmentSlots.findIndex((s: any) => s.id === slotId);
      if (index !== -1) {
        getMockDb().mockAppointmentSlots[index].isBooked = isBooked;
      }
      return getMockDb().mockAppointmentSlots[index] || null;
    }
  }

  static async listSlotsByProvider(providerId: string, includeBooked: boolean = true) {
    if (hasDatabase) {
      const whereClause: any = { providerId };
      if (!includeBooked) {
        whereClause.isBooked = false;
      }
      return prisma.appointmentSlot.findMany({
        where: whereClause,
        orderBy: { startTime: 'asc' },
      });
    } else {
      let slots = getMockDb().mockAppointmentSlots.filter((s: any) => s.providerId === providerId);
      if (!includeBooked) {
        slots = slots.filter((s: any) => !s.isBooked);
      }
      return slots.sort((a: any, b: any) => a.startTime.getTime() - b.startTime.getTime());
    }
  }

  static async deleteSlot(id: string) {
    if (hasDatabase) {
      return prisma.appointmentSlot.delete({
        where: { id },
      });
    } else {
      const index = getMockDb().mockAppointmentSlots.findIndex((s: any) => s.id === id);
      if (index === -1) throw new Error('Slot not found');
      const deleted = getMockDb().mockAppointmentSlots[index];
      getMockDb().mockAppointmentSlots.splice(index, 1);
      return deleted;
    }
  }

  // Booking methods
  static async createBooking(data: {
    customerId: string;
    providerId: string;
    serviceId: string;
    slotId: string;
    notes?: string;
  }) {
    if (hasDatabase) {
      // Prisma transaction to create booking and mark slot booked
      return prisma.$transaction(async (tx) => {
        // Double check slot availability
        const slot = await tx.appointmentSlot.findUnique({
          where: { id: data.slotId },
        });
        if (!slot || slot.isBooked) {
          throw new Error('Appointment slot is already booked or unavailable.');
        }

        // Mark slot as booked
        await tx.appointmentSlot.update({
          where: { id: data.slotId },
          data: { isBooked: true },
        });

        // Create booking
        return tx.booking.create({
          data: {
            customerId: data.customerId,
            providerId: data.providerId,
            serviceId: data.serviceId,
            slotId: data.slotId,
            notes: data.notes,
            status: 'REQUESTED',
          },
          include: {
            service: true,
            slot: true,
          },
        });
      });
    } else {
      // Mock Transaction
      const slotIndex = getMockDb().mockAppointmentSlots.findIndex((s: any) => s.id === data.slotId);
      if (slotIndex === -1 || getMockDb().mockAppointmentSlots[slotIndex].isBooked) {
        throw new Error('Appointment slot is already booked or unavailable.');
      }

      getMockDb().mockAppointmentSlots[slotIndex].isBooked = true;

      const newBooking = {
        id: `booking-uuid-${Math.random().toString(36).substr(2, 9)}`,
        customerId: data.customerId,
        providerId: data.providerId,
        serviceId: data.serviceId,
        slotId: data.slotId,
        status: 'REQUESTED' as BookingStatus,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getMockDb().mockBookings.push(newBooking);

      const service = getMockDb().mockServiceListings.find((s: any) => s.id === data.serviceId);
      const slot = getMockDb().mockAppointmentSlots[slotIndex];

      return {
        ...newBooking,
        service,
        slot,
      };
    }
  }

  static async findById(id: string) {
    if (hasDatabase) {
      return prisma.booking.findUnique({
        where: { id },
        include: {
          customer: true,
          provider: { include: { user: true } },
          service: true,
          slot: true,
          review: true,
        },
      });
    } else {
      const b = getMockDb().mockBookings.find((x: any) => x.id === id);
      if (!b) return null;
      const customer = getMockDb().mockUsers.find((u: any) => u.id === b.customerId);
      const provider = getMockDb().mockProviderProfiles.find((p: any) => p.id === b.providerId);
      const providerUser = provider ? getMockDb().mockUsers.find((u: any) => u.id === provider.userId) : null;
      const service = getMockDb().mockServiceListings.find((s: any) => s.id === b.serviceId);
      const slot = getMockDb().mockAppointmentSlots.find((s: any) => s.id === b.slotId);
      
      return {
        ...b,
        customer,
        provider: provider ? { ...provider, user: providerUser } : null,
        service,
        slot,
        review: null,
      };
    }
  }

  static async updateStatus(id: string, status: BookingStatus) {
    if (hasDatabase) {
      return prisma.booking.update({
        where: { id },
        data: { status },
        include: {
          service: true,
          slot: true,
          customer: true,
        },
      });
    } else {
      const index = getMockDb().mockBookings.findIndex((b: any) => b.id === id);
      if (index === -1) throw new Error('Booking not found');
      
      getMockDb().mockBookings[index].status = status;
      getMockDb().mockBookings[index].updatedAt = new Date();
      
      const b = getMockDb().mockBookings[index];
      const service = getMockDb().mockServiceListings.find((s: any) => s.id === b.serviceId);
      const slot = getMockDb().mockAppointmentSlots.find((s: any) => s.id === b.slotId);
      const customer = getMockDb().mockUsers.find((u: any) => u.id === b.customerId);

      // If cancelled, free up the slot!
      if (status === 'CANCELLED' && slot) {
        const slotIdx = getMockDb().mockAppointmentSlots.findIndex((s: any) => s.id === slot.id);
        if (slotIdx !== -1) {
          getMockDb().mockAppointmentSlots[slotIdx].isBooked = false;
        }
      }

      return {
        ...b,
        service,
        slot,
        customer,
      };
    }
  }

  static async listByCustomer(customerId: string) {
    if (hasDatabase) {
      return prisma.booking.findMany({
        where: { customerId },
        include: {
          provider: { include: { user: true } },
          service: true,
          slot: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return getMockDb().mockBookings
        .filter((b: any) => b.customerId === customerId)
        .map((b: any) => {
          const provider = getMockDb().mockProviderProfiles.find((p: any) => p.id === b.providerId);
          const providerUser = provider ? getMockDb().mockUsers.find((u: any) => u.id === provider.userId) : null;
          const service = getMockDb().mockServiceListings.find((s: any) => s.id === b.serviceId);
          const slot = getMockDb().mockAppointmentSlots.find((s: any) => s.id === b.slotId);
          
          return {
            ...b,
            provider: provider ? { ...provider, user: providerUser } : null,
            service,
            slot,
          };
        });
    }
  }

  static async listByProvider(providerId: string) {
    if (hasDatabase) {
      return prisma.booking.findMany({
        where: { providerId },
        include: {
          customer: true,
          service: true,
          slot: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return getMockDb().mockBookings
        .filter((b: any) => b.providerId === providerId)
        .map((b: any) => {
          const customer = getMockDb().mockUsers.find((u: any) => u.id === b.customerId);
          const service = getMockDb().mockServiceListings.find((s: any) => s.id === b.serviceId);
          const slot = getMockDb().mockAppointmentSlots.find((s: any) => s.id === b.slotId);
          
          return {
            ...b,
            customer,
            service,
            slot,
          };
        });
    }
  }
}
