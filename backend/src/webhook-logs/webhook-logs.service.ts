import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WebhookLog, WebhookLogDocument } from '../schemas/webhook-logs.schema';
import { PaginatedResult } from 'src/pagination/pagination.service';

@Injectable()
export class WebhookLogService {
  private readonly logger = new Logger(WebhookLogService.name);

  constructor(
    @InjectModel(WebhookLog.name)
    private readonly webhookLogModel: Model<WebhookLogDocument>
  ) { }

  // creating webhook log entry
  // here i will keep it to be processed only once [processed = false]
  async createWebhookLog(logData: {
    collect_id: string;
    status: number;
    payload: Record<string, any>;
    idempotency_key: string;
    error_message?: string;
    processed?: boolean;
  }): Promise<WebhookLogDocument> {
    try {
      const webhookLog = new this.webhookLogModel({
        collect_id: new Types.ObjectId(logData.collect_id),
        status: logData.status,
        payload: logData.payload,
        error_message: logData.error_message,
        received_at: new Date(),
        idempotency_key: logData.idempotency_key,
        processed: logData.processed || false, // Default to false if not provided
      });

      const savedLog = await webhookLog.save();
      this.logger.log(`Webhook logged for collect_id: ${logData.collect_id}`);
      return savedLog;
    } catch (error) {
      this.logger.error(`Webhook log failed: ${error.message}`);
      throw new Error(`Could not save webhook log: ${error.message}`);
    }
  }

  async findLogs(
    filter: any = {},
    page: number = 1,
    limit: number = 10,
    sort: Record<string, number> = { received_at: -1 }
  ): Promise<PaginatedResult<WebhookLog>> {
    const skip = (page - 1) * limit;

    const data = await this.webhookLogModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.webhookLogModel.countDocuments(filter);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsProcessedAtomically(id: string | Types.ObjectId): Promise<boolean> {
    // Use findOneAndUpdate with a filter that ensures the document is not already processed

    const idString = typeof id === 'object' ? id.toString() : id;
    const result = await this.webhookLogModel.findOneAndUpdate(
      { _id: idString, processed: false },
      { $set: { processed: true, processed_at: new Date() } },
      { new: true }
    );

    if (result) {
      this.logger.log(`Webhook ${id} marked as processed successfully`);
      return true; // Successfully marked as processed
    } else {
      this.logger.warn(`Webhook ${id} was already processed or not found`);
      return false; // Already processed or not found
    }
  }

  async findByIndempotencyKey(indempotencyKey: string): Promise<WebhookLog | null> {
    return this.webhookLogModel.findOne({ idempotency_key: indempotencyKey }).exec();
  }
}