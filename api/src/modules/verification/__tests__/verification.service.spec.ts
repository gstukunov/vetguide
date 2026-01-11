import { Test, TestingModule } from '@nestjs/testing';
import { VerificationService } from '../verification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VerificationCode } from '../entity/verification.entity';
import { User } from '../../user/entities/user.entity';
import { SmsService } from '../../sms/sms.service';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

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
      create: jest.fn(),
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
      mockUserRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.create.mockReturnValue({
        phone,
        code: mockCode,
      });
      mockVerificationRepository.save.mockResolvedValue({
        id: 1,
        code: mockCode,
      });
      mockSmsService.sendSms.mockResolvedValue(true);

      const result = await service.generateCode(phone);

      expect(result).toBe(mockCode);
      expect(mockVerificationRepository.create).toHaveBeenCalledWith({
        phone,
        code: mockCode,
      });
      expect(mockSmsService.sendSms).toHaveBeenCalledWith(
        phone,
        `Одноразовый код для подтверждения номера телефона: ${mockCode}`,
      );
      expect(console.log).not.toHaveBeenCalled();
    });

    it('должен генерировать код и выводить в консоль в режиме разработки', async () => {
      mockConfigService.get.mockReturnValue('development');
      mockUserRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.create.mockReturnValue({
        phone,
        code: mockCode,
      });
      mockVerificationRepository.save.mockResolvedValue({
        id: 1,
        code: mockCode,
      });

      const result = await service.generateCode(phone);

      expect(result).toBe(mockCode);
      expect(mockVerificationRepository.create).toHaveBeenCalledWith({
        phone,
        code: mockCode,
      });
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
      mockUserRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.create.mockReturnValue({
        phone,
        code: mockCode,
      });
      mockVerificationRepository.save.mockResolvedValue({
        id: 1,
        code: mockCode,
      });

      const result = await service.generateCode(phone);

      expect(result).toBe(mockCode);
      expect(mockVerificationRepository.create).toHaveBeenCalledWith({
        phone,
        code: mockCode,
      });
      expect(mockSmsService.sendSms).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it('должен разрешать регистрацию для существующего пользователя если isVerifyingRegistration = false', async () => {
      const existingUser = {
        id: '1',
        phone: '+79001234567',
      };
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockConfigService.get.mockReturnValue('development');
      mockVerificationRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.save.mockResolvedValue({
        id: 1,
        code: mockCode,
      });

      const result = await service.generateCode(phone, false);

      expect(result).toBe(mockCode);
      expect(mockVerificationRepository.save).toHaveBeenCalled();
    });

    it('должен выбрасывать ошибку при попытке повторной отправки кода через 30 секунд', async () => {
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

    it('должен разрешить отправку кода через 61 секунду', async () => {
      const lastCode = {
        createdAt: new Date(Date.now() - 61000), // 61 секунда назад
      };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue('development');
      mockVerificationRepository.findOne.mockResolvedValue(lastCode);
      mockVerificationRepository.create.mockReturnValue({
        phone,
        code: mockCode,
      });
      mockVerificationRepository.save.mockResolvedValue({
        id: 1,
        code: mockCode,
      });

      const result = await service.generateCode(phone);

      expect(result).toBe(mockCode);
      expect(mockVerificationRepository.create).toHaveBeenCalledWith({
        phone,
        code: mockCode,
      });
      expect(mockVerificationRepository.save).toHaveBeenCalled();
    });
  });

  describe('verifyCode', () => {
    const phone = '+79001234567';
    const code = '123456';

    beforeEach(() => {
      mockVerificationRepository.createQueryBuilder.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      });
    });

    it('должен успешно подтвердить правильный код', async () => {
      const mockRecord = {
        phone,
        code,
        isVerified: false,
        createdAt: new Date(),
      };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.count.mockResolvedValue(0);
      mockVerificationRepository.findOne.mockResolvedValue(mockRecord);
      mockVerificationRepository.save.mockResolvedValue({
        ...mockRecord,
        isVerified: true,
      });

      const result = await service.verifyCode(phone, code);

      expect(result).toBe(true);
      expect(mockRecord.isVerified).toBe(true);
      expect(mockVerificationRepository.save).toHaveBeenCalledWith(mockRecord);
    });

    it('должен вернуть false для неправильного кода и сохранить неудачную попытку', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.count.mockResolvedValue(0);
      mockVerificationRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.create = jest.fn().mockReturnValue({
        phone,
        code,
        isVerified: false,
      });
      mockVerificationRepository.save.mockResolvedValue({
        id: 1,
        phone,
        code,
        isVerified: false,
      });

      const result = await service.verifyCode(phone, code);

      expect(result).toBe(false);
      expect(mockVerificationRepository.create).toHaveBeenCalledWith({
        phone,
        code,
        isVerified: false,
      });
      expect(mockVerificationRepository.save).toHaveBeenCalled();
    });

    it('должен выбросить ошибку если номер уже используется при регистрации', async () => {
      const existingUser = {
        id: '1',
        phone,
      };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.verifyCode(phone, code, true)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { phone },
      });
    });

    it('должен разрешить верификацию для существующего пользователя если isVerifyingRegistration = false', async () => {
      const existingUser = {
        id: '1',
        phone,
      };
      const mockRecord = {
        phone,
        code,
        isVerified: false,
        createdAt: new Date(),
      };
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockVerificationRepository.count.mockResolvedValue(0);
      mockVerificationRepository.findOne.mockResolvedValue(mockRecord);
      mockVerificationRepository.save.mockResolvedValue({
        ...mockRecord,
        isVerified: true,
      });

      const result = await service.verifyCode(phone, code, false);

      expect(result).toBe(true);
    });

    it('должен выбросить TooManyRequestsException при превышении лимита попыток', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.count.mockResolvedValue(6); // Больше лимита в 5

      await expect(service.verifyCode(phone, code)).rejects.toThrow(
        'Лимит попыток подтверждения номера телефона превышен',
      );
    });

    it('должен разрешить верификацию если попыток ровно 5 (лимит)', async () => {
      const mockRecord = {
        phone,
        code,
        isVerified: false,
        createdAt: new Date(),
      };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.count.mockResolvedValue(5); // Ровно лимит
      mockVerificationRepository.findOne.mockResolvedValue(mockRecord);
      mockVerificationRepository.save.mockResolvedValue({
        ...mockRecord,
        isVerified: true,
      });

      const result = await service.verifyCode(phone, code);

      expect(result).toBe(true);
    });

    it('должен очистить старые коды перед проверкой', async () => {
      const queryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };
      mockVerificationRepository.createQueryBuilder.mockReturnValue(
        queryBuilder,
      );
      mockUserRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.count.mockResolvedValue(0);
      mockVerificationRepository.findOne.mockResolvedValue(null);
      mockVerificationRepository.create = jest.fn().mockReturnValue({
        phone,
        code,
        isVerified: false,
      });
      mockVerificationRepository.save.mockResolvedValue({
        id: 1,
        phone,
        code,
        isVerified: false,
      });

      await service.verifyCode(phone, code);

      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('getRecentAttempts', () => {
    const phone = '+79001234567';

    it('должен вернуть количество попыток за последние 10 минут по умолчанию', async () => {
      mockVerificationRepository.count.mockResolvedValue(3);

      const result = await service.getRecentAttempts(phone);

      expect(result).toBe(3);
      expect(mockVerificationRepository.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          phone,
          createdAt: expect.any(Object),
        }),
      });
    });

    it('должен вернуть количество попыток за указанное количество минут', async () => {
      mockVerificationRepository.count.mockResolvedValue(5);

      const result = await service.getRecentAttempts(phone, 5);

      expect(result).toBe(5);
      expect(mockVerificationRepository.count).toHaveBeenCalled();
    });

    it('должен вернуть 0 если попыток не было', async () => {
      mockVerificationRepository.count.mockResolvedValue(0);

      const result = await service.getRecentAttempts(phone);

      expect(result).toBe(0);
    });
  });

  describe('isPhoneVerified', () => {
    const phone = '+79001234567';

    beforeEach(() => {
      mockVerificationRepository.createQueryBuilder.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      });
    });

    it('должен вернуть true если номер подтвержден недавно', async () => {
      const recentVerifiedCode = {
        phone,
        code: '123456',
        isVerified: true,
        createdAt: new Date(Date.now() - 5 * 60000), // 5 минут назад
      };
      mockVerificationRepository.findOne.mockResolvedValue(recentVerifiedCode);

      const result = await service.isPhoneVerified(phone);

      expect(result).toBe(true);
    });

    it('должен вернуть false если код подтвержден более 10 минут назад', async () => {
      const oldVerifiedCode = {
        phone,
        code: '123456',
        isVerified: true,
        createdAt: new Date(Date.now() - 11 * 60000), // 11 минут назад
      };
      mockVerificationRepository.findOne.mockResolvedValue(oldVerifiedCode);

      const result = await service.isPhoneVerified(phone);

      expect(result).toBe(false);
    });

    it('должен вернуть false если подтвержденный код не найден', async () => {
      mockVerificationRepository.findOne.mockResolvedValue(null);

      const result = await service.isPhoneVerified(phone);

      expect(result).toBe(false);
    });

    it('должен вернуть false если код найден но не подтвержден', async () => {
      const unverifiedCode = {
        phone,
        code: '123456',
        isVerified: false,
        createdAt: new Date(),
      };
      mockVerificationRepository.findOne.mockResolvedValue(unverifiedCode);

      const result = await service.isPhoneVerified(phone);

      expect(result).toBe(false);
    });

    it('должен очистить старые коды перед проверкой', async () => {
      const queryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };
      mockVerificationRepository.createQueryBuilder.mockReturnValue(
        queryBuilder,
      );
      mockVerificationRepository.findOne.mockResolvedValue(null);

      await service.isPhoneVerified(phone);

      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.execute).toHaveBeenCalled();
    });

    it('должен вернуть false для кода подтвержденного ровно 10 минут назад (граничное значение)', async () => {
      const exactlyTenMinutesAgo = new Date(Date.now() - 10 * 60000);
      const verifiedCode = {
        phone,
        code: '123456',
        isVerified: true,
        createdAt: exactlyTenMinutesAgo,
      };
      mockVerificationRepository.findOne.mockResolvedValue(verifiedCode);

      const result = await service.isPhoneVerified(phone);

      // Код создан ровно 10 минут назад, что равно или меньше порога, поэтому false
      expect(result).toBe(false);
    });

    it('должен вернуть true для кода подтвержденного чуть меньше 10 минут назад', async () => {
      const almostTenMinutesAgo = new Date(Date.now() - 9 * 60000 - 59000); // 9 минут 59 секунд
      const verifiedCode = {
        phone,
        code: '123456',
        isVerified: true,
        createdAt: almostTenMinutesAgo,
      };
      mockVerificationRepository.findOne.mockResolvedValue(verifiedCode);

      const result = await service.isPhoneVerified(phone);

      expect(result).toBe(true);
    });
  });

  describe('cleanOldCodes', () => {
    it('должен удалить коды старше 1 часа', async () => {
      const queryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };
      mockVerificationRepository.createQueryBuilder.mockReturnValue(
        queryBuilder,
      );

      await service.cleanOldCodes();

      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'createdAt < :date',
        expect.objectContaining({
          date: expect.any(Date),
        }),
      );
      expect(queryBuilder.execute).toHaveBeenCalled();
    });

    it('должен правильно вычислить время для удаления (1 час назад)', async () => {
      const queryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };
      mockVerificationRepository.createQueryBuilder.mockReturnValue(
        queryBuilder,
      );

      const beforeCall = Date.now();
      await service.cleanOldCodes();
      const afterCall = Date.now();

      const callTime = queryBuilder.where.mock.calls[0][1].date.getTime();
      const oneHourAgo = Date.now() - 60 * 60000;

      // Время должно быть примерно час назад (с допустимой погрешностью в несколько миллисекунд)
      expect(callTime).toBeLessThanOrEqual(beforeCall - 60 * 60000);
      expect(callTime).toBeGreaterThanOrEqual(oneHourAgo - 1000);
      expect(callTime).toBeLessThanOrEqual(afterCall - 60 * 60000);
    });
  });
});
