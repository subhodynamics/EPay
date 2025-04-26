import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { OrdersModule } from './orders/orders.module';
import { OrderStatusModule } from './order-status/orders-status.module';
import { WebhookLogsModule } from './webhook-logs/webhook-logs.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payment/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}), //loads environment variables from .env file
    MongooseModule.forRootAsync({ // Asynchronous configuration for MongoDB
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('MongoDB'); // create a logger instance with context 'MongoDB' -> log, error;
        const uri = configService.get<string>('MONGODB_URI'); // gets the MongoDB URI from environment variables

        if (!uri) { // check if the uri is defined
          throw new Error('MONGODB_URI is not defined in environment variables');
        }

        return {
          uri,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              logger.log('MongoDB connection established successfully');
            });
            connection.on('error', (error) => {
              logger.error('MongoDB connection error:', error);
              throw new Error('DB is not connected');
            });
            return connection;
          }
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRY') || '1h' // Either take it from env or Fallback to 1h
        },
      }),
      inject: [ConfigService],
    }),
    OrdersModule,
    OrderStatusModule,
    WebhookLogsModule,
    UserModule,
    AuthModule,
    PaymentsModule,
  ],
})
export class AppModule { }