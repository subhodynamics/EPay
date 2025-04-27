import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsObject, ValidateNested, IsOptional, IsNumber } from 'class-validator';

export class StudentIndoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}

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

  @IsString()
  @IsOptional()
  trustee_id?: string;

  @ValidateNested()
  @Type(() => StudentIndoDto)
  student_info: StudentIndoDto;

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