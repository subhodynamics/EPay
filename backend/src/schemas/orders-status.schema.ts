import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from './orders.schema';

export type OrderStatusDocument = OrderStatus & Document;

@Schema()
export class OrderStatus {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, unique: true })
  collect_id: Types.ObjectId;

  @Prop({ required: true })
  order_amount: number;

  @Prop({ required: true })
  transaction_amount: number;

  @Prop()
  payment_made?: string;

  @Prop()
  payment_details?: string;

  @Prop()
  bank_reference?: string;

  @Prop()
  payment_message?: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  error_message?: string;

  @Prop({ type: Date })
  payment_time?: Date;
}

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);

OrderStatusSchema.index({ collect_id: 1 });