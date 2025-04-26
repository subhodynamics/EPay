import { Module } from "@nestjs/common";
import { MongooseModule }  from "@nestjs/mongoose";
import { User, UserSchema } from "../schemas/user.schema";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
// import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [UserController],
    providers: [UserService],
  })
  export class UserModule {}