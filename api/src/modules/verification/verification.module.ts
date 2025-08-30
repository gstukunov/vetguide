import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VerificationCode } from './entity/verification.entity';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { SmsModule } from '../sms/sms.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCode, User]),
    SmsModule,
    ConfigModule,
  ],
  providers: [VerificationService],
  controllers: [VerificationController],
  exports: [VerificationService],
})
export class VerificationModule {}
