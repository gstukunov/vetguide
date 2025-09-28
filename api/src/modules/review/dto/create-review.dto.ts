import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Length, Matches } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsString()
  description: string;
  @ApiProperty()
  @IsNumber()
  rating: number;
  @ApiProperty({ example: 'V1StGXR8_Z5jdHi6B-myT' })
  @IsString()
  @Length(21, 21)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'ID должен содержать только буквы, цифры, дефисы и подчеркивания',
  })
  doctorId: string;
}
