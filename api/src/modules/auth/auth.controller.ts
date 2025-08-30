import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { SafeUser } from '../user/types/user.type';
import { IpThrottlerGuard } from '../../common/guards/ip-throttler.guard';
import { AccessDto } from '../../common/dto/access.dto';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard, IpThrottlerGuard)
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Успешно авторизован',
    type: AccessDto,
  })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Токены успешно обновлены',
    type: AccessDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Недействительный refresh токен',
  })
  refresh(@Req() req: any) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.authService.refresh(user.userId, user.phone, user.role);
  }
}
