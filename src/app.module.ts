import { Module } from '@nestjs/common';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { ExceptionsModule } from './infrastructure/exceptions/exceptions.module';
import { ControllersModule } from './infrastructure/controllers/controllers.module';
import { RepositoriesModule } from './infrastructure/repositories/repositories.module';

/**
 * Main module of the application, responsible for bootstrapping and configuring the application.
 */
@Module({
  imports: [
    LoggerModule, // Import the LoggerModule to enable logging functionality
    ExceptionsModule, // Import the ExceptionsModule to handle custom exceptions
    ControllersModule, // Import the ControllersModule to define and manage controllers
    RepositoriesModule, // Import the RepositoriesModule to handle data repositories
  ],
})
export class AppModule {}
