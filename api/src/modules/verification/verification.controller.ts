import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { TooManyRequestsException } from '../../common/exceptions/too-many-requests.exception';
import { IpThrottlerGuard } from '../../common/guards/ip-throttler.guard';

@ApiTags('Верификация')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}
}
