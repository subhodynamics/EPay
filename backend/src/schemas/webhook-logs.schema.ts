import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookLogsDocument = WebhookLogs & Document;

@Schema({ timestamps: true })
export class WebhookLogs {
  @Prop({ required: true, type: Object })
  payload: object;

  @Prop({ required: true, type: Date })
  received_at: Date;
}

export const WebhookLogsSchema = SchemaFactory.createForClass(WebhookLogs);