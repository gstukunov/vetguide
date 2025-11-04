import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hash } from 'bcrypt';
import { SafeUser } from './types/user.type'; // Импортируем тип
import { UserRole } from './types/role.enum';
import { VerificationService } from '../verification/verification.service';
import { JwtService } from '@nestjs/jwt';
import { AccessDto } from '../../common/dto/access.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly verificationService: VerificationService,
    private readonly jwtService: JwtService,
  ) {}

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['reviews', 'clinic'],
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }

  async requestPhoneChange(phone: string): Promise<void> {
    await this.verificationService.generateCode(phone, true);
  }

  async verifyCode(
    phone: string,
    code: string,
    isRegistration: boolean,
  ): Promise<boolean> {
    return this.verificationService.verifyCode(phone, code, isRegistration);
  }

  async create(
    phone: string,
    password: string,
    fullName: string,
    role: UserRole = UserRole.USER,
  ): Promise<AccessDto> {
    // Проверяем, существует ли пользователь
    const existingUser = await this.userRepo.findOne({ where: { phone } });
    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким номером телефона уже существует',
      );
    }

    // Проверяем, подтвержден ли телефон
    const isPhoneVerified =
      await this.verificationService.isPhoneVerified(phone);

    if (!isPhoneVerified) {
      throw new BadRequestException('Ваш номер телефона не подтвержден');
    }

    // Создаем пользователя
    const hashedPassword = await hash(password, 10);
    const newUser = this.userRepo.create({
      phone,
      fullName,
      password: hashedPassword,
      role,
      isVerified: true, // Телефон уже подтвержден
    });
    await this.userRepo.save(newUser);

    const { password: _, ...safeUser } = newUser;

    const payload = {
      phone: phone,
      sub: newUser.id,
      role: newUser.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { ...payload, refreshToken: true },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '1d' },
    );

    return { accessToken, refreshToken };
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<SafeUser> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    user.role = newRole;
    await this.userRepo.save(user);

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { phone } });
  }

  async findSafeUserByPhone(phone: string): Promise<SafeUser | null> {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) return null;

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async verifyUser(phone: string): Promise<void> {
    await this.userRepo.update({ phone }, { isVerified: true });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async requestPasswordRecovery(phone: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException(
        'Пользователь с таким номером телефона не найден',
      );
    }
    // Generate and send verification code
    await this.verificationService.generateCode(phone, false);
  }

  async resetPassword(
    phone: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Пароли не совпадают');
    }

    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException(
        'Пользователь с таким номером телефона не найден',
      );
    }

    const isVerified = await this.verificationService.isPhoneVerified(phone);
    if (!isVerified) {
      throw new BadRequestException(
        'Телефон не подтвержден или время подтверждения истекло',
      );
    }

    user.password = await hash(newPassword, 10);
    await this.userRepo.save(user);
  }
}
