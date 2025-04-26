import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../schemas/user.schema';

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8) // Minimum password length
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}