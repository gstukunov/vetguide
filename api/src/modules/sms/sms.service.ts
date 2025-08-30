import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly sender: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get('SMS_API_URL') || '';
    this.apiKey = this.configService.get('SMS_API_KEY') || '';
    this.sender = this.configService.get('SMS_SENDER_NAME') || '';
  }

  async sendSms(phone: string, message: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/`, {
          params: {
            method: 'push_msg',
            key: this.apiKey,
            text: message,
            phone: this.normalizePhone(phone),
            sender: this.sender,
          },
        }),
      );

      // Проверяем успешность отправки
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data.includes('accepted');
    } catch (error) {
      console.error('Ошибка в отправке смс:', error);
      return false;
    }
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '').replace(/^8/, '7').replace(/^\+7/, '7');
  }
}
