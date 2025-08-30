import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({ description: 'Полное имя врача' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Описание врача', required: false })
  @IsString()
  @IsOptional()
  description?: string;

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

  @ApiProperty({ description: 'ID ветклиники' })
  @IsNumber()
  clinicId: number;
}
