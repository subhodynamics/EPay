import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config(); // load env variables

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established successfully');
  });
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
    throw new Error('DB is not connected');
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
