import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  CreateUserDto,
  PasswordRecoveryRequestDto,
  PasswordResetDto,
} from './dto/create-user.dto';
import { SafeUserDto } from './dto/safe-user.dto';
import { AccessDto } from '../../common/dto/access.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { IpThrottlerGuard } from '../../common/guards/ip-throttler.guard';
import { RequestPhoneChangeDto } from './dto/request-phone-change.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { TooManyRequestsException } from '../../common/exceptions/too-many-requests.exception';

@ApiTags('Пользователь')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Информация о пользователе
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Информация о пользователе',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователь успешно получен',
    type: SafeUserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  async getMe(@User('userId') userId: string): Promise<SafeUserDto> {
    return this.userService.getMe(userId);
  }

  /**
   * Регистрация пользователя
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Регистрация пользовтеля',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно зарегистрирован',
    type: SafeUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Телефон не подтверждён',
  })
  async completeRegistration(
    @Body() createUserDto: CreateUserDto,
  ): Promise<AccessDto> {
    return this.userService.create(
      createUserDto.phone,
      createUserDto.password,
      createUserDto.fullName,
    );
  }

  @Post('request-code')
  @ApiOperation({ summary: 'Запросить код для регистрации' })
  @ApiBody({ type: RequestPhoneChangeDto })
  @UseGuards(IpThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Верификационный код отправлен',
  })
  @ApiResponse({
    status: 429,
    description: 'Слишком много запросов',
  })
  async requestPhoneChange(
    @Body() dto: RequestPhoneChangeDto,
  ): Promise<{ message: string }> {
    await this.userService.requestPhoneChange(dto.phone);
    return { message: 'Код подтверждения отправлен' };
  }

  @Post('verify-code')
  @UseGuards(IpThrottlerGuard)
  @ApiBody({ type: VerifyCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Результат верификации',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Превышено количество попыток подтверждения номера телефона',
  })
  async verifyCode(@Body() dto: VerifyCodeDto) {
    try {
      const isValid = await this.userService.verifyCode(
        dto.phone,
        dto.code,
        true,
      );

      return {
        valid: isValid,
        message: isValid
          ? 'Телефон успешно подтвержден'
          : 'Неверный код верификации',
      };
    } catch (error) {
      if (error instanceof TooManyRequestsException) {
        throw new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
      }
      throw error;
    }
  }

  /**
   * Восстановление пароля
   */
  @Post('request-password-recovery')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Запросить восстановление пароля (отправка кода)' })
  @ApiBody({ type: PasswordRecoveryRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Код подтверждения отправлен',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пользователь с таким номером телефона не найден',
  })
  async requestPasswordRecovery(
    @Body() dto: PasswordRecoveryRequestDto,
  ): Promise<{ message: string }> {
    await this.userService.requestPasswordRecovery(dto.phone);
    return { message: 'Код подтверждения отправлен' };
  }

  @Post('verify-password-recovery')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Запросить восстановление пароля (отправка кода)' })
  @ApiBody({ type: PasswordRecoveryRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Код подтверждения отправлен',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пользователь с таким номером телефона не найден',
  })
  async verifyPasswordRecovery(
    @Body() dto: VerifyCodeDto,
  ): Promise<{ message: string }> {
    await this.userService.verifyCode(dto.phone, dto.code, false);
    return { message: 'Смена пароля разрешена' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Сбросить пароль после подтверждения телефона' })
  @ApiBody({ type: PasswordResetDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Пароль успешно изменён' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Телефон не подтвержден или время подтверждения истекло / Пароли не совпадают',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пользователь с таким номером телефона не найден',
  })
  async resetPassword(
    @Body() dto: PasswordResetDto,
  ): Promise<{ message: string }> {
    await this.userService.resetPassword(
      dto.phone,
      dto.password,
      dto.passwordConfirmation,
    );
    return { message: 'Пароль успешно изменён' };
  }
}
