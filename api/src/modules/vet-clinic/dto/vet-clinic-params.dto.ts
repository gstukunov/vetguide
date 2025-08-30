import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class VetClinicParamsDto {
  @ApiProperty({
    description: 'ID ветеринарной клиники',
    example: 1,
    type: 'integer',
  })
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error('ID должен быть числом');
    }
    return num;
  })
  @IsInt()
  @IsPositive()
  id: number;
}
