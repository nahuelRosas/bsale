import { Module } from '@nestjs/common';
import { DatabaseFlightsRepository } from './flights.repository';
import { PrismaModule } from '../config/prisma/prisma.module';
import { ExceptionsService } from '../exceptions/exceptions.service';

@Module({
  imports: [PrismaModule],
  providers: [DatabaseFlightsRepository, ExceptionsService],
  exports: [DatabaseFlightsRepository],
})
export class RepositoriesModule {}
