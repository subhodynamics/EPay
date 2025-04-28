import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WebhookLogService } from './webhook-logs.service';
import { AuthGuard } from '@nestjs/passport';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../pagination/pagination.dto';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum WebhookLogSortField {
  RECEIVED_AT = 'received_at',
  STATUS = 'status',
}

export class WebhookLogQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(WebhookLogSortField)
  sort?: WebhookLogSortField = WebhookLogSortField.RECEIVED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  processed?: boolean;
}

@Controller('webhook-logs')
@UseGuards(AuthGuard('jwt'))
export class WebhookLogsController {
  constructor(private readonly webhookLogService: WebhookLogService) {}

  @Get()
  async getLogs(@Query() query: WebhookLogQueryDto) {
    const filter = {};
    if (query.processed !== undefined) {
      filter['processed'] = query.processed;
    }
    
    // Create sort object
    const sort = {};
    if(query.sort) {
        sort[query.sort] = query.order === SortOrder.ASC ? 1 : -1;
    }
    
    return this.webhookLogService.findLogs(
      filter,
      query.page,
      query.limit,
      sort
    );
  }
}