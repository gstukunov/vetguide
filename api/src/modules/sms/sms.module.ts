import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [SmsService],
  controllers: [SmsController],
  exports: [SmsService],
})
export class SmsModule {}
