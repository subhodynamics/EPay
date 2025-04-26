import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  school_id: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  callback_url: string;

  // This method will generate the JWT signature
  generateSignature(pgKey: string): string {
    return require('jsonwebtoken').sign(
      {
        school_id: this.school_id,
        amount: this.amount,
        callback_url: this.callback_url
      },
      pgKey
    );
  }
}