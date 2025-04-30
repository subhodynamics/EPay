import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as cors from 'cors';

async function bootstrap() {
  dotenv.config(); // Load environment variables

  const app = await NestFactory.create(AppModule);

  // MongoDB connection logs
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established successfully');
  });
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
    throw new Error('DB is not connected');
  });

  // Enable global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS using the `cors` library
  app.use(
    cors({
      origin: [
        "http://localhost:5173", // For local development
        "https://epay.subhadeep.in", // For production
      ], // Allow requests from your frontend
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allowed HTTP methods
      credentials: true, // Allow cookies if needed
      allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
    }),
  );

  // Middleware to handle preflight requests explicitly (optional, for debugging)
  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      console.log('Handling preflight request');
      return res.sendStatus(204); // Respond to preflight request
    }
    next();
  });

  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

bootstrap();