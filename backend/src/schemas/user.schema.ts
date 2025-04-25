import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

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
    match: /^\S+@\S+\.\S+$/ // Basic email validation
  })
  email: string;

  @Prop({ 
    required: true, 
    type: String,
    select: false // Prevents password from being returned in queries
  })
  password: string;

  @Prop({ 
    required: true,
    type: String,
    enum: Object.values(UserRole), // Uses enum values
    default: UserRole.SCHOOL_STAFF 
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