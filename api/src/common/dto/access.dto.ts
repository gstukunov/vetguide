import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString } from 'class-validator';

export class AccessDto {
  @ApiProperty({ example: 'AEfdeacd3qd213341wqdeadca...' })
  @IsString()
  accessToken: string;

  @ApiProperty()
  @IsString()
  refreshToken: string;
}
