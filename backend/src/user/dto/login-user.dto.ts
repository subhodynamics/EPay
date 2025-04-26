import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail() // property decorator : validation email
  email: string;

  @IsString() // property decorator : validating password
  password: string;
}