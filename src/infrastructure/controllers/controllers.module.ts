import { Module } from '@nestjs/common';
import { ExceptionsModule } from '../exceptions/exceptions.module';
import { FlightModule } from './flights/flight.module';

@Module({
  imports: [ExceptionsModule, FlightModule],
})
export class ControllersModule {}
