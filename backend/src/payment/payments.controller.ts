import { Body, Controller, Get, Post, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CheckPaymentDto } from './dto/check-payment.dto';
import { CheckPaymentParamDto } from './dto/check-payment-param.dto';
import { CheckPaymentQueryDto } from './dto/check-payment-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment')
  @UseGuards(AuthGuard('jwt'))
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
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