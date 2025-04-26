import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    const { name, email, password, role } = registerUserDto;
    return this.usersService.register(name, email, password, role);
  }
}