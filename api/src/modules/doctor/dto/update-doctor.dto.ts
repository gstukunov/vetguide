import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class UpdateDoctorDto {
  @ApiProperty({ description: 'Full name of the doctor', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ description: 'Doctor description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Doctor photo key in S3', required: false })
  @IsString()
  @IsOptional()
  photoKey?: string;

  @ApiProperty({
    description: 'Array of doctor specializations',
    type: [String],
    required: false,
    example: ['Cardiology', 'Surgery', 'Dermatology'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialization?: string[];

  @ApiProperty({
    description: 'ID of the veterinary clinic',
    required: false,
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @IsString()
  @Length(21, 21)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'ID должен содержать только буквы, цифры, дефисы и подчеркивания',
  })
  @IsOptional()
  clinicId?: string;
}
