import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderStatus, OrderStatusSchema } from '../schemas/orders-status.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderStatus.name, schema: OrderStatusSchema },
    ]),
  ],
})
export class OrderStatusModule {}