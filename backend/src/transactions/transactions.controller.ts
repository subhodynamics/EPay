import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@nestjs/passport';
import { TransactionQueryDto } from './dto/transactions-query.dto';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getAllTransactions(@Query() query: TransactionQueryDto) {
    return this.transactionsService.getTransactions(
      query.page,
      query.limit,
      query.sort,
      query.order,
      query.status ? { 'status.status': query.status } : {}
    );
  }

  @Get('school/:schoolId')
  async getSchoolTransactions(
    @Param('schoolId') schoolId: string,
    @Query() query: TransactionQueryDto
  ) {
    return this.transactionsService.getTransactionsBySchool(
      schoolId,
      query.page,
      query.limit,
      query.sort,
      query.order
    );
  }

  @Get('status/:collectRequestId')
  async getTransactionStatus(@Param('collectRequestId') collectRequestId: string) {
    return this.transactionsService.getTransactionStatus(collectRequestId);
  }
}