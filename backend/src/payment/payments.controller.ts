import { Body, Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  // @Get('check-payment')
  // async checkPayment(@Body() createPaymentDto: CreatePaymentDto) {
  //   return this.paymentsService.checkPayment(createPaymentDto);
  // }

  // @Get('callback')
  // async callback(@Body() createPaymentDto: CreatePaymentDto) {
  //   return this.paymentsService.callback(createPaymentDto);
  // }
}