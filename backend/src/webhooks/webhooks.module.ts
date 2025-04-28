import { Module } from '@nestjs/common';
import { WebhookController } from './webhooks.controller';
import { WebhookLogsModule } from '../webhook-logs/webhook-logs.module';
import { OrdersModule } from '../orders/orders.module';
import { OrderStatusModule } from '../order-status/orders-status.module';

@Module({
  imports: [
    WebhookLogsModule,
    OrdersModule,
    OrderStatusModule,
  ],
  controllers: [WebhookController],
})
export class WebhookModule {}