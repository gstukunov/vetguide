import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { compare } from 'bcrypt';
import { UserRole } from '../../user/types/role.enum';
import { User } from '../../user/entities/user.entity';

// Mock bcrypt
jest.mock('bcrypt');
const mockCompare = compare;

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockVetClinic = {
    id: 1,
    name: 'Test Clinic',
    address: 'Test Address',
    inn: '1234567890',
    description: 'Test Description',
    doctors: [],
    users: [],
  };

  const mockUser: User = {
    id: 1,
    phone: '+79123456789',
    password: 'hashedPassword',
    fullName: 'Test User',
    isVerified: true,
    role: UserRole.USER,
    reviews: [],
    clinic: mockVetClinic,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSafeUser = {
    id: 1,
    phone: '+79123456789',
    fullName: 'Test User',
    isVerified: true,
    role: UserRole.USER,
    reviews: [],
    clinic: mockVetClinic,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByPhone: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return safe user when credentials are valid', async () => {
      jest.spyOn(userService, 'findByPhone').mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(true as never);

      const result = await service.validateUser('+79123456789', 'password');

      expect(result).toEqual(mockSafeUser);
      expect(userService.findByPhone).toHaveBeenCalledWith('+79123456789');
      expect(mockCompare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return null when user not found', async () => {
      jest.spyOn(userService, 'findByPhone').mockResolvedValue(null);

      const result = await service.validateUser('+79123456789', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      jest.spyOn(userService, 'findByPhone').mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(false as never);

      const result = await service.validateUser('+79123456789', 'password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens when credentials are valid', async () => {
      const mockAccessToken = 'access.token.here';
      const mockRefreshToken = 'refresh.token.here';
      const loginData = {
        phone: '+79123456789',
        password: 'password123',
      };

      jest.spyOn(userService, 'findByPhone').mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(true as never);
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.login(loginData);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });

      expect(userService.findByPhone).toHaveBeenCalledWith(loginData.phone);
      expect(mockCompare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledWith({
        phone: mockUser.phone,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const loginData = {
        phone: '+79123456789',
        password: 'password123',
      };

      jest.spyOn(userService, 'findByPhone').mockResolvedValue(null);

      await expect(service.login(loginData)).rejects.toThrow('User not found');
      expect(userService.findByPhone).toHaveBeenCalledWith(loginData.phone);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const loginData = {
        phone: '+79123456789',
        password: 'wrongpassword',
      };

      jest.spyOn(userService, 'findByPhone').mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(false as never);

      await expect(service.login(loginData)).rejects.toThrow(
        'Invalid password',
      );
      expect(userService.findByPhone).toHaveBeenCalledWith(loginData.phone);
      expect(mockCompare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
    });
  });

  describe('refresh', () => {
    it('should return new access and refresh tokens', async () => {
      const mockAccessToken = 'new.access.token.here';
      const mockRefreshToken = 'new.refresh.token.here';

      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.refresh(1, '+79123456789', UserRole.USER);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });

      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });
});
