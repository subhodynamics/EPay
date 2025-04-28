import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from './orders.schema';

export type OrderStatusDocument = OrderStatus & Document;

enum OrderStatusEnum {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Schema( { timestamps: true })
export class OrderStatus {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, unique: true })
  collect_id: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  collect_request_id: string;  // Payment gateway's transaction ID

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

  @Prop()
  payment_mode?: string;

  @Prop({ required: true , enum: OrderStatusEnum })
  status: OrderStatusEnum; //status should not be undefined (atomic)

  @Prop()
  error_message?: string;

  @Prop({ type: Date })
  payment_time?: Date;
}

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);

OrderStatusSchema.index({ collect_id: 1 });