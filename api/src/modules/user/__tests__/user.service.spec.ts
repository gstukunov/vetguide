import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { VerificationService } from '../../verification/verification.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../types/role.enum';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: any;
  let mockVerificationService: any;
  let mockJwtService: any;

  const mockUser = {
    id: 1,
    phone: '+79001234567',
    password: 'hashedPassword',
    fullName: 'Test User',
    role: UserRole.USER,
    isVerified: true,
    reviews: [],
    clinic: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    mockVerificationService = {
      isPhoneVerified: jest.fn(),
      generateCode: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: VerificationService,
          useValue: mockVerificationService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('getMe', () => {
    it('должен возвращать данные пользователя без пароля', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getMe(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['reviews', 'clinic'],
      });
      expect(result).toEqual({
        id: 1,
        phone: '+79001234567',
        fullName: 'Test User',
        role: UserRole.USER,
        isVerified: true,
        reviews: [],
        clinic: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('должен выбрасывать NotFoundException когда пользователь не найден', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getMe(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['reviews', 'clinic'],
      });
    });
  });
});
