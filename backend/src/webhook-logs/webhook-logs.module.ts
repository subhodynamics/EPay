import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookLog, WebhookLogSchema } from '../schemas/webhook-logs.schema';
import { WebhookLogService } from './webhook-logs.service';
import { WebhookLogsController } from './webhook-logs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookLog.name, schema: WebhookLogSchema },
    ]),
  ],
  controllers: [WebhookLogsController],
  providers: [WebhookLogService],
  exports: [WebhookLogService],
})
export class WebhookLogsModule {}