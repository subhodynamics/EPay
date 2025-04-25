import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderStatusDocument = OrderStatus & Document;

@Schema({ timestamps: true })
export class OrderStatus {
  @Prop({ required: true, type: String, ref: 'Order' })
  collect_id: string;

  @Prop({ required: true, type: Number })
  order_amount: number;

  @Prop({ required: true, type: Number })
  transaction_amount: number;

  @Prop({ required: true, type: String })
  payment_mode: string;

  @Prop({ required: true, type: String })
  payment_details: string;

  @Prop({ required: true, type: String })
  bank_reference: string;

  @Prop({ required: true, type: String })
  payment_message: string;

  @Prop({ required: true, type: String })
  status: string;

  @Prop({ required: true, type: String })
  error_message: string;

  @Prop({ required: true, type: Date })
  payment_time: Date;
}

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);