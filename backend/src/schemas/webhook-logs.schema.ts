import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WebhookLogDocument = WebhookLog & Document;

@Schema({ timestamps: true })
export class WebhookLog {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  collect_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({ type: Number, required: true })
  status: number;

  @Prop({ type: String })
  error_message: string;

  @Prop({ type: Date, required: true })
  received_at: Date;

  @Prop({ type: Boolean, default: false })
  processed: boolean;
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);