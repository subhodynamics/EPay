import { Body, Controller, Get, Post, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CheckPaymentDto } from './dto/check-payment.dto';
import { CheckPaymentParamDto } from './dto/check-payment-param.dto';
import { CheckPaymentQueryDto } from './dto/check-payment-query.dto';
import { OrdersService } from '../orders/orders.service';
import { OrderStatusService } from '../order-status/orders-status.service';
import { OrderStatusEnum } from '../order-status/orders-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
    private readonly orderStatusService: OrderStatusService,
  ) {}

@Post('create-payment')
@UseGuards(AuthGuard('jwt'))
async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
  // Call to payment gateway API
  const paymentResponse = await this.paymentsService.createPayment(createPaymentDto);

  // Creating Order with collect_request_id from payment response
  const order = await this.ordersService.createOrder({
    school_id: createPaymentDto.school_id,
    trustee_id: createPaymentDto.trustee_id ?? null,
    student_info: createPaymentDto.student_info,
    collect_request_id: paymentResponse.collect_request_id, // Store collect_request_id
    // gateway_name will come from webhook later
  }) as { _id: string }; // Explicitly type the order object

  // Create initial order status
  const orderStatus = await this.orderStatusService.createInitialStatus({
    collect_id: order._id.toString(),
    collect_request_id: paymentResponse.collect_request_id,
    order_amount: createPaymentDto.amount,
  });

  // After all initial tasks, return the payment response to the client for redirection
  return {
    collect_request_id: paymentResponse.collect_request_id,
    collect_request_url: paymentResponse.collect_request_url,
    sign: paymentResponse.sign,
  };
}

  @Get('check-payment/:collect_request_id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ transform: true }))
  checkPayment(
    @Param() params: CheckPaymentParamDto,
    @Query() query: CheckPaymentQueryDto,
  ) {
    const checkPaymentDto = new CheckPaymentDto();
    checkPaymentDto.collect_request_id = params.collect_request_id; //request is the parameter
    checkPaymentDto.school_id = query.school_id; // school_id is the query parameter

    return this.paymentsService.checkPayment(checkPaymentDto);
  }
}