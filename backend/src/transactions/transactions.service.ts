import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schemas/orders.schema';
import { OrderStatus } from '../schemas/orders-status.schema';
import { SortField, SortOrder } from './dto/transactions-query.dto';
import { PaginatedResult } from '../pagination/pagination.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(OrderStatus.name) private readonly orderStatusModel: Model<OrderStatus>,
  ) {}

  async getTransactions(
    page = 1,
    limit = 10,
    sortField = SortField.PAYMENT_TIME,
    sortOrder = SortOrder.DESC,
    filter = {}
  ): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    // Define sort configuration
    const sort = {};
    
    // Map sort fields to their proper paths in the aggregation result
    switch (sortField) {
      case SortField.PAYMENT_TIME:
        sort['status.payment_time'] = sortOrder === SortOrder.ASC ? 1 : -1;
        break;
      case SortField.STATUS:
        sort['status.status'] = sortOrder === SortOrder.ASC ? 1 : -1;
        break;
      case SortField.TRANSACTION_AMOUNT:
        sort['status.transaction_amount'] = sortOrder === SortOrder.ASC ? 1 : -1;
        break;
      case SortField.STUDENT_NAME:
        sort['student_info.name'] = sortOrder === SortOrder.ASC ? 1 : -1;
        break;
      case SortField.STUDENT_ID:
        sort['student_info.id'] = sortOrder === SortOrder.ASC ? 1 : -1;
        break;
      default:
        sort['status.payment_time'] = -1; // Default sort
    }
    
    // Build match conditions
    const matchConditions = { ...filter };

    // First, count total documents for pagination
    const countPipeline = [
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status',
        },
      },
      { $unwind: '$status' },
      { $match: matchConditions },
      { $count: 'total' },
    ];
    
    const countResult = await this.orderModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;
    
    // Now get the paginated data
    const dataPipeline = [
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status',
        },
      },
      { $unwind: '$status' },
      { $match: matchConditions },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status.order_amount',
          transaction_amount: '$status.transaction_amount',
          status: '$status.status',
          payment_time: '$status.payment_time',
          student_name: '$student_info.name',
          student_id: '$student_info.id',
          custom_order_id: '$collect_request_id',
        },
      },
    ];
    
    const data = await this.orderModel.aggregate(dataPipeline);
    
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

  async getTransactionsBySchool(
    schoolId: string,
    page = 1,
    limit = 10,
    sortField = SortField.PAYMENT_TIME,
    sortOrder = SortOrder.DESC
  ) {
    return this.getTransactions(page, limit, sortField, sortOrder, { school_id: schoolId });
  }

  async getTransactionStatus(collectRequestId: string) {
    const status = await this.orderStatusModel
      .findOne({ collect_request_id: collectRequestId })
      .select('status payment_time transaction_amount payment_details error_message')
      .exec();

    if (!status) {
      return { status: 'NOT_FOUND', message: 'Transaction not found' };
    }

    return status;
  }
}