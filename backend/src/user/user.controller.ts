import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth') // auth route
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('register') // post request on auth/register
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    const { name, email, password, role } = registerUserDto;
    return this.usersService.register(name, email, password, role);
  }

  @Post('login') // post request on auth/login
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    return this.usersService.login(email, password);
  } 
}