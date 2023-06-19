import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma/prisma.service';
import { flight, passenger, seat } from '@prisma/client';
import { ExceptionsService } from '../exceptions/exceptions.service';
import { BoardingPassWithDetails } from '../../domain/model/BoardingPassWithDetails';

@Injectable()
export class DatabaseFlightsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  /**
   * Retrieves a flight by its ID.
   * @param flight_id The ID of the flight to retrieve.
   * @returns A promise that resolves to the flight object or null if not found.
   * @throws Throws an internal server error if an exception occurs.
   */
  async getFlightById({
    flightId,
  }: {
    flightId: number;
  }): Promise<flight | null> {
    try {
      return await this.prisma.flight.findUnique({
        where: { flight_id: flightId },
      });
    } catch (error) {
      this.throwInternalServerError();
    }
  }

  /**
   * Retrieves the boarding passes with details for a given flight ID.
   * @param flight_id The ID of the flight to retrieve boarding passes for.
   * @returns A promise that resolves to an array of BoardingPassWithDetails objects.
   * @throws Throws an internal server error if an exception occurs.
   */
  async getBoardingPassesByFlightId({
    flightId,
  }: {
    flightId: number;
  }): Promise<BoardingPassWithDetails[]> {
    try {
      const boardingPasses = await this.prisma.boarding_pass.findMany({
        where: {
          flight_id: flightId,
        },
        include: {
          seat: true,
          flight: true,
          passenger: true,
          purchase: true,
          seat_type: true,
        },
      });

      return boardingPasses.map((boardingPass) => {
        return new BoardingPassWithDetails(
          boardingPass,
          boardingPass.flight,
          boardingPass.seat,
          boardingPass.passenger,
          boardingPass.purchase,
          boardingPass.seat_type,
        );
      });
    } catch (error) {
      this.throwInternalServerError();
    }
  }

  /**
   * Retrieves the available seats for a given airplane and flight ID.
   * @param airplane_id The ID of the airplane.
   * @param flight_id The ID of the flight.
   * @returns A promise that resolves to an array of seat objects.
   * @throws Throws an internal server error if an exception occurs.
   */
  async getAvailableSeats({
    airplaneId,
    flightId,
  }: {
    airplaneId: number;
    flightId: number;
  }): Promise<seat[]> {
    try {
      const assignedSeatIds = await this.prisma.boarding_pass.findMany({
        where: {
          flight_id: flightId,
          seat_id: {
            not: null,
          },
        },
        select: {
          seat_id: true,
        },
      });

      const availableSeats = await this.prisma.seat.findMany({
        where: {
          airplane_id: airplaneId,
          seat_id: {
            notIn: assignedSeatIds.map((bp) => bp.seat_id),
          },
        },
      });

      return availableSeats;
    } catch (error) {
      this.throwInternalServerError();
    }
  }

  /**
   * Retrieves the passengers for a given array of boarding passes.
   * @param boardingPasses An array of boarding pass objects.
   * @returns A promise that resolves to an array of passenger objects.
   * @throws Throws an internal server error if an exception occurs.
   */
  async getPassengersByBoardingPasses({
    boardingPasses,
  }: {
    boardingPasses: BoardingPassWithDetails[];
  }): Promise<passenger[]> {
    try {
      const passengerIds = boardingPasses.map(
        (boardingPass) => boardingPass.boardingPass.passenger_id,
      );

      const passengers = await this.prisma.passenger.findMany({
        where: {
          passenger_id: {
            in: passengerIds,
          },
        },
      });

      return passengers;
    } catch (error) {
      this.throwInternalServerError();
    }
  }

  private throwInternalServerError(): void {
    this.exceptionsService.internalServerErrorException({
      code_error: 500,
      message: 'Internal Server Error',
    });
  }
}
