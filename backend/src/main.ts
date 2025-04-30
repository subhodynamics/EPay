import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';

async function bootstrap() {

  dotenv.config(); // load env variables

  const app = await NestFactory.create(AppModule);

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established successfully');
  });
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
    throw new Error('DB is not connected');
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    }),
  );

  app.enableCors({
    origin: 'http://localhost:5173', // Allow requests from your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Include OPTIONS for preflight
    credentials: true, // Allow cookies if needed
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  });

  // app.enableCors();

  // app.useGlobalGuards(new (AuthGuard('jwt'))()); // Use JWT Auth Guard globally

  // await app.listen(process.env.PORT ?? 3000);
  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}
bootstrap();