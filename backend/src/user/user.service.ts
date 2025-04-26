import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService
  ) { }

  // Method to register a new user
  async register(
    name: string,
    email: string,
    password: string,
    role: string,
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = new this.userModel({ name, email, password, role });
    return newUser.save(); 
  }

  // Method to login a user (will receive a jwt token in response)
  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.userModel.findOne({ email }).select('+password'); // select the pswrd (not done by default (check schema))
    if (!user) {
      throw new ConflictException('Invalid credentials');
    }

    // console.log('user found: ', user);
    // console.log('stored hached password: ', user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id, role: user.role }; // will sign this payload with secret key
    const access_token = this.jwtService.sign(payload);

    return { access_token }; // returning the signed
  }
}