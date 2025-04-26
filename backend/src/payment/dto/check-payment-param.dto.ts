import { IsString, IsNotEmpty } from 'class-validator';

export class CheckPaymentParamDto {
  @IsString()
  @IsNotEmpty()
  collect_request_id: string;
}