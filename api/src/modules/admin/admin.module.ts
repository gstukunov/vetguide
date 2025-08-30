import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, ConfigModule, JwtModule.register({})],
  controllers: [AdminController],
})
export class AdminModule {}
