import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, IsOptional } from 'class-validator';

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

  @ApiProperty({ description: 'ID of the veterinary clinic', required: false })
  @IsNumber()
  @IsOptional()
  clinicId?: number;
}
