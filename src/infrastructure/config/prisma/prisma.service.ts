import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get the Prisma delegate for the `flight` model.
   */
  get flight(): Prisma.flightDelegate<never> {
    return this.prisma.flight;
  }

  /**
   * Get the Prisma delegate for the `seat` model.
   */
  get seat(): Prisma.seatDelegate<never> {
    return this.prisma.seat;
  }

  /**
   * Get the Prisma delegate for the `passenger` model.
   */
  get passenger(): Prisma.passengerDelegate<never> {
    return this.prisma.passenger;
  }

  /**
   * Get the Prisma delegate for the `boarding_pass` model.
   */
  get boarding_pass(): Prisma.boarding_passDelegate<never> {
    return this.prisma.boarding_pass;
  }

  /**
   * Get the Prisma delegate for the `seat_type` model.
   */
  get seat_type(): Prisma.seat_typeDelegate<never> {
    return this.prisma.seat_type;
  }

  /**
   * Get the Prisma delegate for the `airplane` model.
   */
  get airplane(): Prisma.airplaneDelegate<never> {
    return this.prisma.airplane;
  }
}
