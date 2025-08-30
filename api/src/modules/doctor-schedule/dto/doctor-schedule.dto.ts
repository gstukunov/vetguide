import { IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WeekDay } from '../entities/doctor-schedule.entity';

export class CreateDoctorScheduleDto {
  @ApiProperty({
    enum: WeekDay,
    description: 'День недели',
    example: WeekDay.MONDAY,
    enumName: 'WeekDay',
  })
  @IsEnum(WeekDay)
  dayOfWeek: WeekDay;

  @ApiProperty({
    description: 'Доступен ли врач в этот день',
    example: true,
  })
  @IsBoolean()
  isAvailable: boolean;
}

export class UpdateDoctorScheduleDto {
  @ApiProperty({
    description: 'Статус доступности врача',
    example: false,
  })
  @IsBoolean()
  isAvailable: boolean;
}
