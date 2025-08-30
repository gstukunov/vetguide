import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '../entities/review.entity';
import { IsString } from 'class-validator';

export class UpdateReviewStatusDto {
  @ApiProperty({
    description: 'Обновление статуса определенного отзыва',
    example: 'PENDING | VERIFIED',
  })
  @IsString()
  status: ReviewStatus;
}
