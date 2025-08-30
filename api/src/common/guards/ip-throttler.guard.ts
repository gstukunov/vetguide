/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class IpThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(context: ExecutionContext): Promise<string> {
    try {
      // Универсальный способ получения HTTP-контекста
      const httpContext = (context as any).switchToHttp
        ? (context as any).switchToHttp()
        : null;

      if (!httpContext) {
        return 'non-http-context';
      }

      const request = httpContext.getRequest();

      // Обработка заголовка x-forwarded-for
      const forwardedHeader = request.headers['x-forwarded-for'];

      if (forwardedHeader) {
        if (Array.isArray(forwardedHeader)) {
          return forwardedHeader[0].split(',')[0].trim();
        }
        return forwardedHeader.split(',')[0].trim();
      }

      // Совместимый способ получения IP
      if (request.ip) {
        return request.ip;
      }

      // Альтернативные способы получения IP
      if (request.connection?.remoteAddress) {
        return request.connection.remoteAddress;
      }

      if (request.socket?.remoteAddress) {
        return request.socket.remoteAddress;
      }

      // Фолбек для локальных запросов
      return '127.0.0.1';
    } catch (error) {
      console.error('Error in IpThrottlerGuard.getTracker:', error);
      return 'error-fallback';
    }
  }
}
