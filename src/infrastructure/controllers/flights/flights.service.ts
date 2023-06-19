import { Injectable } from '@nestjs/common';
import { passenger, seat, flight } from '@prisma/client';
import { BoardingPassWithDetails } from '../../../domain/model/BoardingPassWithDetails';
import { DatabaseFlightsRepository } from '../../repositories/flights.repository';
import { ExceptionsService } from '../../exceptions/exceptions.service';

@Injectable()
export class FlightService {
  constructor(
    private readonly flightsRepository: DatabaseFlightsRepository,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  // Initialize data object to store flight-related information
  private data = {
    flight: {} as flight,
    availableSeats: [] as seat[],
    boardingPasses: [] as BoardingPassWithDetails[],
    passengers: [] as passenger[],
    groupedBoardingPasses: {} as Record<string, BoardingPassWithDetails[]>,
  };

  /**
   * Retrieves flight data including available seats, boarding passes, passengers, and grouped boarding passes.
   * @param id - The ID of the flight.
   * @returns An object containing flight data or an error code and an empty object if the flight is not found.
   */
  async getFlightData({ id }: { id: number }): Promise<
    | { code: number; data: object }
    | {
        code: number;
        data: {
          flight: flight;
          availableSeats: seat[];
          boardingPasses: BoardingPassWithDetails[];
          passengers: passenger[];
          groupedBoardingPasses: Record<string, BoardingPassWithDetails[]>;
        };
      }
  > {
    const flightId = Number(id);
    // Retrieve flight details by ID
    this.data.flight = await this.flightsRepository.getFlightById({
      flightId,
    });

    // If the flight is not found, return error code 404
    if (!this.data.flight) {
      return {
        code: 404,
        data: {},
      };
    }

    // Retrieve boarding passes for the flight
    this.data.boardingPasses =
      await this.flightsRepository.getBoardingPassesByFlightId({
        flightId,
      });

    // Retrieve passengers associated with the boarding passes
    this.data.passengers =
      await this.flightsRepository.getPassengersByBoardingPasses({
        boardingPasses: this.data.boardingPasses,
      });

    // Group boarding passes by purchase ID and sort them by passenger age
    this.data.groupedBoardingPasses =
      await this.groupBoardingPassesByPurchaseId({
        boardingPasses: this.data.boardingPasses,
      });

    // Retrieve available seats for the flight
    this.data.availableSeats = await this.flightsRepository.getAvailableSeats({
      airplaneId: this.data.flight.airplane_id,
      flightId,
    });

    // Process boarding passes for each purchase ID
    for (const purchaseId in this.data.groupedBoardingPasses) {
      const boardingPasses = this.data.groupedBoardingPasses[purchaseId];

      // Segregate boarding passes by passenger age into adults and children
      const segregatedBoardingPasses = await this.segregateBoardingPassesByAge({
        boardingPasses: boardingPasses,
        passengers: this.data.passengers,
      });

      // Find adjacent seats for the boarding passes
      const adjacentSeats = await this.findAdjacentSeats({
        availableSeats: this.data.availableSeats,
        boardingPasses: segregatedBoardingPasses,
      });

      // Assign seats to the boarding passes based on adjacent seat availability
      const assignResult = await this.assignSeats({
        adjacentSeats,
        boardingPasses: this.data.boardingPasses,
        availableSeats: this.data.availableSeats,
        boardingPassesGroup: boardingPasses,
      });

      // Update the boarding passes and available seats after seat assignment
      this.data.boardingPasses = assignResult.boardingPasses;
      this.data.availableSeats = assignResult.availableSeats;
    }

    // Return flight data with success code 200
    return {
      code: 200,
      data: this.data,
    };
  }

  /**
   * Groups boarding passes by purchase ID and sorts them by passenger age.
   * @param boardingPasses - The boarding passes to group and sort.
   * @returns A record containing grouped and sorted boarding passes.
   * @throws An error if there is an issue grouping and sorting the boarding passes.
   */
  async groupBoardingPassesByPurchaseId({
    boardingPasses,
  }: {
    boardingPasses: BoardingPassWithDetails[];
  }): Promise<Record<string, BoardingPassWithDetails[]>> {
    try {
      // Group boarding passes by purchase ID
      const groupedBoardingPasses = boardingPasses.reduce(
        (acc, boardingPass) => {
          const purchaseId = boardingPass.purchase.purchase_id;
          if (acc[purchaseId]) {
            acc[purchaseId].push(boardingPass);
          } else {
            acc[purchaseId] = [boardingPass];
          }
          return acc;
        },
        {},
      );

      // Sort boarding passes within each group by passenger age
      for (const purchaseId in groupedBoardingPasses) {
        groupedBoardingPasses[purchaseId].sort((a, b) =>
          a.passenger.age < b.passenger.age ? -1 : 1,
        );
      }

      return groupedBoardingPasses;
    } catch (error) {
      // Handle internal server error if grouping and sorting fails
      this.exceptionsService.internalServerErrorException({
        message: error as string,
        code_error: 500,
      });
    }
  }

  /**
   * Segregates boarding passes by passenger age into adults and children.
   * @param boardingPasses - The boarding passes to segregate.
   * @param passengers - The list of passengers associated with the boarding passes.
   * @returns An object containing segregated boarding passes for adults and children.
   * @throws An error if there is an issue segregating the boarding passes.
   */
  async segregateBoardingPassesByAge({
    boardingPasses,
    passengers,
  }: {
    boardingPasses: BoardingPassWithDetails[];
    passengers: passenger[];
  }): Promise<{
    adults: BoardingPassWithDetails[];
    children: BoardingPassWithDetails[];
  }> {
    try {
      // Segregate boarding passes by passenger age into adults and children
      const groupedBoardingPasses = await boardingPasses.reduce(
        async (
          accPromise: Promise<{
            adults: BoardingPassWithDetails[];
            children: BoardingPassWithDetails[];
          }>,
          boardingPass,
        ) => {
          const acc = await accPromise;
          const passenger_id = boardingPass.passenger.passenger_id;
          const passenger = passengers.find(
            (passenger) => passenger.passenger_id === passenger_id,
          );
          if (passenger) {
            if (passenger.age >= 18) {
              acc.adults.push(boardingPass);
            } else {
              acc.children.push(boardingPass);
            }
          }
          return acc;
        },
        Promise.resolve({ adults: [], children: [] }),
      );

      return groupedBoardingPasses;
    } catch (error) {
      // Handle internal server error if segregation fails
      this.exceptionsService.internalServerErrorException({
        message: error as string,
        code_error: 500,
      });
    }
  }

  /**
   * Finds adjacent seats for a group of boarding passes based on available seats.
   * @param availableSeats - The available seats.
   * @param boardingPasses - The segregated boarding passes.
   * @returns An array of adjacent seats.
   * @throws An error if there is an issue finding adjacent seats.
   */
  async findAdjacentSeats({
    availableSeats,
    boardingPasses,
  }: {
    availableSeats: seat[];
    boardingPasses: {
      adults: BoardingPassWithDetails[];
      children: BoardingPassWithDetails[];
    };
  }): Promise<seat[]> {
    try {
      const { children, adults } = boardingPasses;
      const requiredSeats = children.length + adults.length;

      const filteredSeats = availableSeats.filter((seat) => {
        const seatTypes = adults.map(
          (passenger) => passenger.boardingPass.seat_type_id,
        );
        if (children.length > 0) {
          const childSeatTypes = children.map(
            (passenger) => passenger.boardingPass.seat_type_id,
          );
          return (
            seatTypes.includes(seat.seat_type_id) &&
            childSeatTypes.includes(seat.seat_type_id) &&
            isColumnContinuous(seat, requiredSeats)
          );
        } else {
          return (
            seatTypes.includes(seat.seat_type_id) &&
            isColumnContinuous(seat, requiredSeats)
          );
        }
      });

      function isColumnContinuous(seat, requiredSeats) {
        const seatIndex = availableSeats.findIndex((s) => s === seat);
        const consecutiveSeats = availableSeats.slice(
          seatIndex,
          seatIndex + requiredSeats,
        );
        const seatColumns = consecutiveSeats.map((s) =>
          s.seat_column.charCodeAt(0),
        );
        const sortedColumns = seatColumns.slice().sort((a, b) => a - b);

        return JSON.stringify(seatColumns) === JSON.stringify(sortedColumns);
      }

      // Find passengers with assigned seats
      const passengersWithAssignedSeats = adults.filter(
        (passenger) => passenger.boardingPass.seat_id !== null,
      );

      // Get seat numbers of passengers with assigned seats
      const assignedSeatNumbers = passengersWithAssignedSeats.map(
        (passenger) => passenger.boardingPass.seat_id,
      );

      // Filter out seats that are already assigned
      const unassignedSeats = filteredSeats.filter(
        (seat) => !assignedSeatNumbers.includes(seat.seat_id),
      );

      // Sort unassigned seats by row and column
      unassignedSeats.sort(
        (a, b) =>
          a.seat_row - b.seat_row ||
          a.seat_column.charCodeAt(0) - b.seat_column.charCodeAt(0),
      );

      let consecutiveSeats = [];
      let consecutiveCount = 0;

      for (let i = 0; i < unassignedSeats.length; i++) {
        const currentSeat = unassignedSeats[i];
        const nextSeat = unassignedSeats[i + 1];

        if (currentSeat.seat_row === nextSeat?.seat_row) {
          consecutiveCount++;
          consecutiveSeats.push(currentSeat);

          if (consecutiveCount === requiredSeats - 1) {
            consecutiveSeats.push(nextSeat);
            return consecutiveSeats;
          }
        } else {
          consecutiveCount = 0;
          consecutiveSeats = [];
        }
      }

      // If no consecutive seats are found, try to find the closest seats
      if (consecutiveSeats.length === 0) {
        let closestSeats = [];
        let minDistance = Infinity;

        for (let i = 0; i <= unassignedSeats.length - requiredSeats; i++) {
          const currentSeats = unassignedSeats.slice(i, i + requiredSeats);
          const maxRow = Math.max(...currentSeats.map((seat) => seat.seat_row));
          const minRow = Math.min(...currentSeats.map((seat) => seat.seat_row));
          const distance = maxRow - minRow;

          if (distance < minDistance) {
            closestSeats = currentSeats;
            minDistance = distance;
          }
        }

        if (closestSeats.length === requiredSeats) {
          return closestSeats;
        }
      }

      return [];
    } catch (error) {
      console.error('Error finding adjacent seats:', error);
      throw new Error('Failed to find adjacent seats');
    }
  }

  /**
   * Assigns seats to boarding passes based on adjacent seat availability.
   * @param adjacentSeats - The array of adjacent seats.
   * @param boardingPasses - The boarding passes to assign seats to.
   * @param availableSeats - The available seats.
   * @returns An object containing the updated boarding passes and available seats.
   * @throws An error if there is an issue assigning seats.
   */
  async assignSeats({
    boardingPassesGroup,
    adjacentSeats,
    boardingPasses,
    availableSeats,
  }: {
    boardingPassesGroup: BoardingPassWithDetails[];
    adjacentSeats: seat[];
    boardingPasses: BoardingPassWithDetails[];
    availableSeats: seat[];
  }): Promise<{
    boardingPasses: BoardingPassWithDetails[];
    availableSeats: seat[];
  }> {
    for (const index in boardingPassesGroup) {
      const boardingPass = boardingPassesGroup[index];
      const assignedSeat = adjacentSeats[index];

      const correspondingBoardingPass: BoardingPassWithDetails =
        boardingPasses.find(
          (_boardingPass) =>
            _boardingPass.boardingPass.boarding_pass_id ===
            boardingPass.boardingPass.boarding_pass_id,
        );

      if (
        correspondingBoardingPass &&
        assignedSeat &&
        correspondingBoardingPass.boardingPass.seat_id === null // Check if seat is not already assigned
      ) {
        correspondingBoardingPass.boardingPass.seat_id = assignedSeat.seat_id;
        correspondingBoardingPass.seat = assignedSeat;
        const seatIndex = availableSeats.findIndex(
          (seat) => seat.seat_id === assignedSeat.seat_id,
        );
        if (seatIndex !== -1) {
          availableSeats.splice(seatIndex, 1);
        }
      }
    }
    return {
      boardingPasses,
      availableSeats,
    };
  }

  catch(error) {
    this.exceptionsService.internalServerErrorException({
      message: error as string,
      code_error: 500,
    });
  }
}
