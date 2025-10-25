import { IsDateString, IsString, IsBoolean, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorScheduleDto {
  @ApiProperty({
    description: 'Дата расписания (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Временной слот (HH:mm)',
    example: '09:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'timeSlot must be in HH:mm format',
  })
  timeSlot: string;

  @ApiProperty({
    description: 'Доступен ли временной слот для записи',
    example: true,
    default: true,
  })
  @IsBoolean()
  isAvailable: boolean;
}

export class UpdateDoctorScheduleDto {
  @ApiProperty({
    description: 'Статус доступности временного слота',
    example: false,
  })
  @IsBoolean()
  isAvailable: boolean;
}

export class BulkCreateDoctorScheduleDto {
  @ApiProperty({
    description: 'Дата начала периода (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Дата окончания периода (YYYY-MM-DD)',
    example: '2024-01-21',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Массив временных слотов (HH:mm)',
    example: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    type: [String],
  })
  @IsString({ each: true })
  timeSlots: string[];

  @ApiProperty({
    description:
      'Дни недели для создания расписания (0=воскресенье, 1=понедельник, ..., 6=суббота)',
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  daysOfWeek: number[];
}

export class GetDoctorScheduleDto {
  @ApiProperty({
    description: 'Дата начала периода (YYYY-MM-DD)',
    example: '2024-01-15',
    required: false,
  })
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Дата окончания периода (YYYY-MM-DD)',
    example: '2024-01-21',
    required: false,
  })
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Количество недель для получения',
    example: 2,
    required: false,
  })
  weeks?: number;
}
