import { IsString, IsNotEmpty } from 'class-validator';

export class CheckPaymentDto {
  @IsString()
  @IsNotEmpty()
  collect_request_id: string;

  @IsString()
  @IsNotEmpty()
  school_id: string;
}