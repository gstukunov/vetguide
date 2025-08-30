import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class TopDoctorsQueryDto {
  @ApiProperty({
    description: 'Количество топ докторов для возврата',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Минимальный рейтинг для фильтрации',
    example: 3.0,
    minimum: 1.0,
    maximum: 5.0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1.0)
  @Max(5.0)
  minRating?: number;

  @ApiProperty({
    description: 'Фильтр по специализации',
    example: 'хирург',
    required: false,
  })
  @IsOptional()
  specialization?: string;

  @ApiProperty({
    description: 'ID клиники для фильтрации',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  clinicId?: number;
}
