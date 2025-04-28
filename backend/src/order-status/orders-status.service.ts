import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderStatus, OrderStatusDocument } from '../schemas/orders-status.schema';
import { OrderStatusEnum } from './orders-status.enum';

@Injectable()
export class OrderStatusService {
  private readonly logger = new Logger(OrderStatusService.name);

  constructor(
    @InjectModel(OrderStatus.name) 
    private readonly orderStatusModel: Model<OrderStatusDocument>
  ) {}

  async createInitialStatus(createData: {
    collect_id: string;           // MongoDB _id of the order
    collect_request_id: string;  // Payment gateway's ID
    order_amount: string;
  }): Promise<OrderStatus> {
    try {
      const statusEntry = new this.orderStatusModel({
        collect_id: new Types.ObjectId(createData.collect_id), // Using the field name in your schema
        collect_request_id: createData.collect_request_id,
        order_amount: createData.order_amount,
        transaction_amount: 0,
        status: OrderStatusEnum.PENDING
      });

      return await statusEntry.save();
    } catch (error) {
      this.logger.error(`Failed to create initial status: ${error.message}`);
      throw new Error('Could not create order status entry');
    }
  }

  // Find by collect_request_id from webhook
  async findByCollectRequestId(collectRequestId: string): Promise<OrderStatus | null> {
    const status = await this.orderStatusModel
      .findOne({ collect_request_id: collectRequestId })
      .exec();
    
    return status;
  }

  async updateByCollectId(
    collectId: string,
    updateData: Partial<OrderStatus>
  ): Promise<OrderStatus> {
    try {
      const result = await this.orderStatusModel.findOneAndUpdate(
        { collect_request_id: collectId },
        { $set: updateData },
        { new: true }
      ).exec();

      if (!result) {
        throw new NotFoundException(`Order status not found for collect_request_id: ${collectId}`);
      }

      this.logger.log(`Updated status for collect_request_id: ${collectId}`);
      return result;
    } catch (error) {
      this.logger.error(`Status update failed: ${error.message}`);
      throw new Error(`Could not update order status: ${error.message}`);
    }
  }
}