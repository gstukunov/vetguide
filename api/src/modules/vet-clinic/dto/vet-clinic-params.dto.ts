import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class VetClinicParamsDto {
  @ApiProperty({
    description: 'ID ветеринарной клиники',
    example: 'V1StGXR8_Z5jdHi6B-myT',
    type: 'string',
  })
  @IsString()
  @Length(21, 21)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'ID должен содержать только буквы, цифры, дефисы и подчеркивания',
  })
  id: string;
}
