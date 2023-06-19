import {
  ResponseFormat,
  ResponseInterceptor,
} from './infrastructure/common/interceptors/response.interceptor';
import { LoggingInterceptor } from './infrastructure/common/interceptors/logger.interceptor';
import { AllExceptionFilter } from './infrastructure/common/filter/exception.filter';
import { LoggerService } from './infrastructure/logger/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

/**
 * Bootstrap the Nest.js application.
 * This function initializes and configures the Nest.js application.
 */
async function bootstrap() {
  // Create an instance of the Nest.js application
  const app = await NestFactory.create(AppModule);

  // Add cookie-parser middleware to parse cookies in requests
  // app.use(cookieParser());

  // Set AllExceptionFilter as a global filter to handle exceptions and logs using LoggerService
  app.useGlobalFilters(new AllExceptionFilter(new LoggerService()));

  // Set ValidationPipe as a global pipe to automatically validate incoming requests
  app.useGlobalPipes(new ValidationPipe());

  // Check the environment variable NODE_ENV to determine if the application is running in production
  const env = process.env.NODE_ENV;
  if (env !== 'production') {
    // In non-production environments, add LoggingInterceptor and ResponseInterceptor as global interceptors
    app.useGlobalInterceptors(
      new LoggingInterceptor(new LoggerService()),
      new ResponseInterceptor(),
    );

    // Configure Swagger document using DocumentBuilder
    const config = new DocumentBuilder()
      .addBearerAuth() // Enable Bearer token authentication in Swagger UI
      .setTitle('Bsale API') // Set the title of the API
      .setDescription('Check-In simulation API') // Set the description of the API
      .setVersion('1.0') // Set the version of the API
      .build();

    // Generate Swagger document using the configured app and DocumentBuilder
    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [ResponseFormat], // Include additional models in the Swagger document
      deepScanRoutes: true, // Enable deep scanning of routes to generate accurate API documentation
    });

    // Set up the Swagger UI endpoint using the generated document
    SwaggerModule.setup('api', app, document);
  }

  // Start the application and listen on port 3000
  await app.listen(3000);
}

// Start the application by calling the bootstrap function
bootstrap();
