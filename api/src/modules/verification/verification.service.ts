import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { VerificationCode } from './entity/verification.entity';
import * as crypto from 'crypto';
import { SmsService } from '../sms/sms.service';
import { TooManyRequestsException } from '../../common/exceptions/too-many-requests.exception';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationCode)
    private readonly codeRepo: Repository<VerificationCode>,
    private readonly smsService: SmsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async getRecentAttempts(phone: string, minutes = 10): Promise<number> {
    const timeThreshold = new Date(Date.now() - minutes * 60000);

    return this.codeRepo.count({
      where: {
        phone,
        createdAt: MoreThanOrEqual(timeThreshold), // Используем оператор TypeORM
      },
    });
  }

  async verifyCode(
    phone: string,
    code: string,
    isVerifyingRegistration: boolean = true,
  ): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (user && isVerifyingRegistration) {
      throw new NotFoundException('Номер телефона уже используется');
    }

    await this.cleanOldCodes();
    const attempts = await this.getRecentAttempts(phone);
    if (attempts > 5) {
      throw new TooManyRequestsException(
        'Лимит попыток подтверждения номера телефона превышен, попробуйте позже',
      );
    }

    // Ищем код
    const record = await this.codeRepo.findOne({
      where: { phone, code },
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      // Сохраняем неудачную попытку
      const failedAttempt = this.codeRepo.create({
        phone,
        code,
        isVerified: false,
      });
      await this.codeRepo.save(failedAttempt);
      return false;
    }

    // Помечаем код как подтвержденный
    record.isVerified = true;
    await this.codeRepo.save(record);

    return true;
  }

  async generateCode(
    phone: string,
    isVerifyingRegistration: boolean = true,
  ): Promise<string> {
    // Проверяем, когда последний раз отправляли код
    const user = await this.userRepo.findOne({ where: { phone } });
    if (user && isVerifyingRegistration) {
      throw new NotFoundException('Номер телефона уже используется');
    }

    const lastCode = await this.codeRepo.findOne({
      where: { phone },
      order: { createdAt: 'DESC' },
    });

    if (lastCode && Date.now() - lastCode.createdAt.getTime() < 60000) {
      throw new HttpException(
        'Повторная отправка кода возможна через 1 минуту',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const code = crypto.randomInt(100000, 999999).toString();
    const verificationCode = this.codeRepo.create({ phone, code });
    await this.codeRepo.save(verificationCode);

    const message = `Одноразовый код для подтверждения номера телефона: ${code}`;

    // В режиме разработки не отправляем SMS, только выводим в консоль
    const nodeEnv = this.configService.get('NODE_ENV');
    if (nodeEnv === 'development' || !nodeEnv) {
      console.log('🔐 [DEV MODE] Verification code generated:');
      console.log(`📱 Phone: ${phone}`);
      console.log(`🔑 Code: ${code}`);
      console.log(`📝 Message: ${message}`);
      console.log('---');
    } else {
      // В продакшене отправляем SMS как обычно
      await this.smsService.sendSms(phone, message);
    }

    return code;
  }

  async isPhoneVerified(phone: string): Promise<boolean> {
    await this.cleanOldCodes();
    const verifiedCode = await this.codeRepo.findOne({
      where: { phone, isVerified: true },
      order: { createdAt: 'DESC' },
    });

    if (!verifiedCode) return false;

    // Проверяем, что с момента подтверждения прошло не более 10 минут
    const tenMinutesAgo = new Date(Date.now() - 10 * 60000);
    const isNotExpired: boolean = verifiedCode.createdAt > tenMinutesAgo;

    return isNotExpired && verifiedCode.isVerified;
  }

  async cleanOldCodes(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60000);
    await this.codeRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < :date', { date: oneHourAgo })
      .execute();
  }
}
