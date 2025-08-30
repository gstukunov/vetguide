import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, Matches, MinLength } from 'class-validator';
import { Match } from '../decorators/match.decorator';
import { PASSWORD_REGEX } from '../../../common/constants/auth';

export class CreateUserDto {
  @ApiProperty({ example: '+79123456789' })
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty({ example: 'Иванов Иван Иванович' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @IsString()
  fullName: string;

  @ApiProperty({ minLength: 8, example: 'pasSwor!d1' })
  @IsString()
  @Matches(PASSWORD_REGEX, {
    message:
      'Пароль должен содержать 8-70 символов, включать цифры, буквы верхнего и нижнего регистра, специальные символы',
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Должен совпадать с паролем',
    example: 'pasSwor!d1',
  })
  @IsString()
  @MinLength(8)
  @Match('password', { message: 'Пароли не совпадают' }) // Кастомный валидатор
  confirmPassword: string;
}

export class PasswordRecoveryRequestDto {
  @ApiProperty({ example: '+79123456789' })
  @IsPhoneNumber('RU')
  phone: string;
}

export class PasswordResetDto {
  @ApiProperty({ example: '+79123456789' })
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty({ minLength: 8, example: 'newPassw0rd!' })
  @IsString()
  password: string;

  @ApiProperty({ minLength: 8, example: 'newPassw0rd!' })
  @IsString()
  passwordConfirmation: string;
}
