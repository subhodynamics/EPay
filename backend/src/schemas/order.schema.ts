import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, type: String })
  school_id: string;

  @Prop({ required: true, type: String })
  trustee_id: string;

  @Prop({
    required: true,
    type: {
      name: String,
      id: String,
      email: String,
    },
  })
  student_info: {
    name: string;
    id: string;
    email: string;
  };

  @Prop({ required: true, type: String })
  gateway_name: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);