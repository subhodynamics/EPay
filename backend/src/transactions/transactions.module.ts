import { Module }  from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Order, OrderSchema } from '../schemas/orders.schema';
import { OrderStatus, OrderStatusSchema } from '../schemas/orders-status.schema';

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: Order.name, schema: OrderSchema },
        { name: OrderStatus.name, schema: OrderStatusSchema },
      ]),
    ],
    controllers: [TransactionsController],
    providers: [TransactionsService],
    exports: [TransactionsService],
  })
  export class TransactionsModule {}