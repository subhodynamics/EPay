import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WebhookLog, WebhookLogDocument } from '../schemas/webhook-logs.schema';

@Injectable()
export class WebhookLogService {
  private readonly logger = new Logger(WebhookLogService.name);

  constructor(
    @InjectModel(WebhookLog.name)
    private readonly webhookLogModel: Model<WebhookLogDocument>
  ) {}

  // creating webhook log entry
  // here i will keep it to be processed only once [processed = false]
  async createWebhookLog(logData: {
    collect_id: string;
    status: number;
    payload: Record<string, any>;
    error_message?: string;
  }): Promise<WebhookLog> {
    try {
      const webhookLog = new this.webhookLogModel({
        collect_id: new Types.ObjectId(logData.collect_id),
        status: logData.status,
        payload: logData.payload,
        error_message: logData.error_message,
        received_at: new Date()
      });

      const savedLog = await webhookLog.save();
      this.logger.log(`Webhook logged for collect_id: ${logData.collect_id}`);
      return savedLog;
    } catch (error) {
      this.logger.error(`Webhook log failed: ${error.message}`);
      throw new Error(`Could not save webhook log: ${error.message}`);
    }
  }
}