import { IsString, IsNotEmpty } from 'class-validator';

export class CheckPaymentQueryDto {
  @IsString()
  @IsNotEmpty()
  school_id: string;
}