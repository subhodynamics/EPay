import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';

// Define roles as enum for better type safety
export enum UserRole {
  ADMIN = 'admin',
  TRUSTEE = 'trustee',
  SCHOOL_STAFF = 'school_staff',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ 
    required: true, 
    type: String, 
    unique: true,
    validator : (value : string) => isEmail(value), // Validate email format
    message: 'Invalid email format', // Custom error message
    index: true // Index for faster lookups
  })
  email: string;

  @Prop({
    required: true,
    type: String,
    select: false,
    validate: {
      validator: (value: string) => value.length >= 8,
      message: 'Password must be at least 8 characters long',
    },
  })
  password: string;

  @Prop({ 
    required: true,
    type: String,
    enum: Object.values(UserRole), // Uses enum values
    default: UserRole.SCHOOL_STAFF,
    index: true // Index for faster lookups
  })
  role: UserRole;
}

// Create the schema FIRST
export const UserSchema = SchemaFactory.createForClass(User);

// Add pre-save hook with proper typing
UserSchema.pre<UserDocument>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});