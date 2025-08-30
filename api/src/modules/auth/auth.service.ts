import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { compare } from 'bcrypt';
import { SafeUser } from '../user/types/user.type';
import { AccessDto } from '../../common/dto/access.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(phone: string, pass: string): Promise<SafeUser | null> {
    const user = await this.userService.findByPhone(phone);

    if (!user) return null;

    const isMatch: boolean = await compare(pass, user.password);

    if (isMatch) {
      const { password, ...safeUser } = user;
      return safeUser;
    }

    return null;
  }

  async login(loginData: LoginDto): Promise<AccessDto> {
    const user = await this.userService.findByPhone(loginData.phone);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch: boolean = await compare(loginData.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = {
      phone: user.phone,
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { ...payload, refreshToken: true },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '1d' },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(
    userId: number,
    phone: string,
    role: string,
  ): Promise<AccessDto> {
    // Проверяем, что пользователь существует
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      phone,
      sub: userId,
      role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { ...payload, refreshToken: true },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '1d' },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
