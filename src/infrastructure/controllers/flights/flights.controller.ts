import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FlightService } from './flights.service';
import { ExceptionsService } from '../../exceptions/exceptions.service';
import { flight, passenger, seat } from '@prisma/client';
import { BoardingPassWithDetails } from '../../../domain/model/BoardingPassWithDetails';

type FlightData = {
  flight: flight;
  availableSeats: seat[];
  boardingPasses: BoardingPassWithDetails[];
  passengers: passenger[];
  groupedBoardingPasses: Record<string, BoardingPassWithDetails[]>;
};

@Controller('flights')
@ApiTags('flights')
// @ApiResponse({ status: 400, description: 'Internal error' })
export class FlightController {
  constructor(
    private readonly exceptionsService: ExceptionsService,
    private readonly flightService: FlightService,
  ) {}

  /**
   * Retrieves the passengers of a specific flight.
   * @param id - The ID of the flight.
   * @returns An object containing the flight details and its passengers.
   */
  @Get(':id/passengers')
  async getFlightPassengers(@Param('id') id: string): Promise<any> {
    const flightId = Number(id);
    const response = await this.flightService.getFlightData({ id: flightId });
    if (response.code !== 200) {
      return response;
    }

    const data: FlightData = response.data as FlightData;
    const _response = {
      code: response.code,
      data: {
        flightId: data.flight.flight_id,
        takeoffDateTime: data.flight.takeoff_date_time,
        takeoffAirport: data.flight.takeoff_airport,
        landingDateTime: data.flight.landing_date_time,
        landingAirport: data.flight.landing_airport,
        airplaneId: data.flight.airplane_id,
        passengers: data.boardingPasses.map((bp) => {
          return {
            passengerId: bp.passenger.passenger_id,
            dni: bp.passenger.dni,
            name: bp.passenger.name,
            age: bp.passenger.age,
            country: bp.passenger.country,
            boardingPassId: bp.boardingPass.boarding_pass_id,
            purchaseId: bp.purchase.purchase_id,
            seatTypeId: bp.boardingPass.seat_type_id,
            seatId: bp.boardingPass.seat_id,
            // seatNumber: `${bp.seat.seat_row} ${bp.seat.seat_column}`,
          };
        }),
      },
    };

    return _response;
  }
}
