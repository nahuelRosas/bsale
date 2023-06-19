import { Module } from '@nestjs/common';
import { FlightController } from './flights.controller';
import { FlightService } from './flights.service';
import { ExceptionsModule } from '../../exceptions/exceptions.module';
import { RepositoriesModule } from '../../repositories/repositories.module';

@Module({
  imports: [ExceptionsModule, RepositoriesModule],
  controllers: [FlightController],
  providers: [FlightService],
})
export class FlightModule {}
