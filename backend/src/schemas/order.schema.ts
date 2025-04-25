import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsEmail, IsNotEmpty } from 'class-validator';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  school_id: Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  trustee_id: Types.ObjectId | string;

  @Prop({
    type: {
      name: { type: String, required: true, trim: true },
      id: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
    },
    required: true,
  })
  student_info: {
    name: string;
    id: string;
    email: string;
  };

  @Prop({ type: String, required: true, trim: true })
  gateway_name: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);