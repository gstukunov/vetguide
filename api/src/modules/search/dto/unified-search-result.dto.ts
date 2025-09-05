import { ApiProperty } from '@nestjs/swagger';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { VetClinic } from '../../vet-clinic/entities/vet-clinic.entity';

export class UnifiedSearchResultDto {
  @ApiProperty({ type: () => [Doctor], description: 'Список найденных врачей' })
  doctors: Doctor[];

  @ApiProperty({
    type: () => [VetClinic],
    description: 'Список найденных клиник',
  })
  clinics: VetClinic[];

  @ApiProperty({ description: 'Количество найденных врачей', example: 0 })
  totalDoctors: number;

  @ApiProperty({ description: 'Количество найденных клиник', example: 0 })
  totalClinics: number;

  @ApiProperty({ description: 'Общее количество результатов', example: 0 })
  totalResults: number;
}
