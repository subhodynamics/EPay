import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../schemas/orders.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>
  ) {}

  async createOrder(createOrderDto: {
    school_id: string;
    trustee_id?: string | null;
    student_info: {
      name: string;
      id: string;
      email: string;
    };
    collect_request_id: string; // Add this field
    gateway_name?: string;
  }): Promise<Order> {
    // Create object with only fields that have values
    const orderData: any = {
      school_id: createOrderDto.school_id,
      student_info: createOrderDto.student_info,
      collect_request_id: createOrderDto.collect_request_id, // Store the collect_request_id
    };
    
    // Only add these fields if they exist
    if (createOrderDto.trustee_id) {
      orderData.trustee_id = createOrderDto.trustee_id;
    }
    
    if (createOrderDto.gateway_name) {
      orderData.gateway_name = createOrderDto.gateway_name;
    }
    
    const createdOrder = new this.orderModel(orderData);
    return createdOrder.save();
  }

  // Find order by collect_request_id
  async findOrderByCollectRequestId(collectId: string): Promise<Order | null> {
    return this.orderModel.findOne({ collect_request_id: collectId }).exec();
  }
  
  // Update with gateway info from webhook
  async updateOrderWithWebhookInfo(collectRequestId: string, gatewayName: string): Promise<Order> {
    const updateOrderStatus = await this.orderModel.findOneAndUpdate(
      { collect_request_id: collectRequestId },
      { gateway_name: gatewayName },
      { new: true }
    ).exec();

    if (!updateOrderStatus) {
      throw new Error(`Order not found for collect_request_id: ${collectRequestId}`);
    }
    return updateOrderStatus;
  }
}