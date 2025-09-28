import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({ description: 'Полное имя врача' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Описание врача', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Ключ фотографии врача в S3', required: false })
  @IsString()
  @IsOptional()
  photoKey?: string;

  @ApiProperty({
    description: 'Список специалитетов врача',
    type: [String],
    required: false,
    example: ['Терапевт', 'Хирург', 'Дерматолог'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialization?: string[];

  @ApiProperty({
    description: 'ID ветклиники',
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @IsString()
  @Length(21, 21)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'ID должен содержать только буквы, цифры, дефисы и подчеркивания',
  })
  clinicId: string;
}
