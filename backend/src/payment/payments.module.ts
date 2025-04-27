import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { OrdersModule } from '../orders/orders.module';
import { OrderStatusModule } from '../order-status/orders-status.module';
import { WebhookLogsModule } from '../webhook-logs/webhook-logs.module';

@Module({
  imports: [
    HttpModule, // HTTP request
    OrdersModule, // ordermodule for order table
    OrderStatusModule, // order status module for order status table
    WebhookLogsModule, // Import the WebhookLogsModule for webhook functionality
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}