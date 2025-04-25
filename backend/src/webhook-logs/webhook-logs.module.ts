import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookLogs, WebhookLogsSchema } from '../schemas/webhook-logs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookLogs.name, schema: WebhookLogsSchema },
    ]),
  ],
})
export class WebhookLogsModule {}