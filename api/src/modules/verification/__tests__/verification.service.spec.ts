import { Test, TestingModule } from '@nestjs/testing';
import { VerificationService } from '../verification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VerificationCode } from '../entity/verification.entity';
import { User } from '../../user/entities/user.entity';
import { SmsService } from '../../sms/sms.service';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('VerificationService', () => {
  let service: VerificationService;
  let mockVerificationRepository: any;
  let mockUserRepository: any;
  let mockSmsService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockVerificationRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn(),
      })),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockSmsService = {
      sendSms: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: getRepositoryToken(VerificationCode),
          useValue: mockVerificationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: SmsService,
          useValue: mockSmsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('generateCode', () => {
    const phone = '+79001234567';
    const mockCode = '123456';

    beforeEach(() => {
      // Mock crypto.randomInt
      jest.spyOn(require('crypto'), 'randomInt').mockReturnValue(123456);

      // Mock console.log
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('должен генерировать код и отправлять SMS в продакшене', async () => {
      mockConfigService.get.mockReturnValue('production');
      mockVerificationRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.save.mockResolvedValue({
        id: 1,
        code: mockCode,
      });
      mockSmsService.sendSms.mockResolvedValue(true);

      const result = await service.generateCode(phone);

      expect(result).toBe(mockCode);
      expect(mockSmsService.sendSms).toHaveBeenCalledWith(
        phone,
        `Одноразовый код для подтверждения номера телефона: ${mockCode}`,
      );
      expect(console.log).not.toHaveBeenCalled();
    });

    it('должен генерировать код и выводить в консоль в режиме разработки', async () => {
      mockConfigService.get.mockReturnValue('development');
      mockVerificationRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.save.mockResolvedValue({
        id: 1,
        code: mockCode,
      });

      const result = await service.generateCode(phone);

      expect(result).toBe(mockCode);
      expect(mockSmsService.sendSms).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        '🔐 [DEV MODE] Verification code generated:',
      );
      expect(console.log).toHaveBeenCalledWith(`📱 Phone: ${phone}`);
      expect(console.log).toHaveBeenCalledWith(`🔑 Code: ${mockCode}`);
    });

    it('должен выбрасывать ошибку при попытке повторной отправки кода менее чем через минуту', async () => {
      const lastCode = {
        createdAt: new Date(Date.now() - 30000), // 30 секунд назад
      };
      mockVerificationRepository.findOne.mockResolvedValue(lastCode);

      await expect(service.generateCode(phone)).rejects.toThrow(
        new HttpException(
          'Повторная отправка кода возможна через 1 минуту',
          HttpStatus.TOO_MANY_REQUESTS,
        ),
      );
    });

    it('должен использовать development как значение по умолчанию для NODE_ENV', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      mockVerificationRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.save.mockResolvedValue({
        id: 1,
        code: mockCode,
      });

      const result = await service.generateCode(phone);

      expect(result).toBe(mockCode);
      expect(mockSmsService.sendSms).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });
  });
});
