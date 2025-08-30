import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '+79123456789' })
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty()
  @IsString()
  password: string;
}
