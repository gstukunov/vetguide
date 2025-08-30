import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({ example: '+79123456789' })
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty({ minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6)
  code: string;
}
