import {
  boarding_pass,
  flight,
  purchase,
  seat_type,
  passenger,
  seat,
} from '@prisma/client';

/**
 * Represents a boarding pass entity with additional details related to a flight, seat, passenger, purchase, and seat type.
 */
export class BoardingPassWithDetails {
  boardingPass: boarding_pass;
  flight: flight;
  seat: seat;
  passenger: passenger;
  purchase: purchase;
  seat_type: seat_type;

  /**
   * Constructs a new instance of BoardingPassWithDetails.
   * @param boardingPass The boarding_pass entity.
   * @param flight The flight entity.
   * @param seat The seat entity.
   * @param passenger The passenger entity.
   * @param purchase The purchase entity.
   * @param seat_type The seat_type entity.
   */
  constructor(
    boardingPass: boarding_pass,
    flight: flight,
    seat: seat,
    passenger: passenger,
    purchase: purchase,
    seat_type: seat_type,
  ) {
    // Assign the provided entities to the corresponding properties
    this.boardingPass = boardingPass;
    this.flight = flight;
    this.seat = seat;
    this.passenger = passenger;
    this.purchase = purchase;
    this.seat_type = seat_type;
  }
}
