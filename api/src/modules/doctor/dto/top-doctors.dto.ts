import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsPositive,
  Min,
  Max,
  IsString,
  Length,
  Matches,
} from 'class-validator';
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
    example: 'V1StGXR8_Z5jdHi6B-myT',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(21, 21)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'ID должен содержать только буквы, цифры, дефисы и подчеркивания',
  })
  clinicId?: string;
}
