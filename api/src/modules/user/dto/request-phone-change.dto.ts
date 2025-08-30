import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class RequestPhoneChangeDto {
  @ApiProperty({ example: '+79123456789' })
  @IsPhoneNumber('RU')
  phone: string;
}
