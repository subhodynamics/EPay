import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../pagination/pagination.dto';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortField {
  PAYMENT_TIME = 'payment_time',
  STATUS = 'status',
  TRANSACTION_AMOUNT = 'transaction_amount',
  STUDENT_NAME = 'student_name',
  STUDENT_ID = 'student_id',
}

export class TransactionQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(SortField)
  sort?: SortField = SortField.PAYMENT_TIME;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  status?: string;
}