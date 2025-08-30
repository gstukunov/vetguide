import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorScheduleService } from './doctor-schedule.service';
import { DoctorScheduleController } from './doctor-schedule.controller';
import { DoctorModule } from '../doctor/doctor.module'; // Для использования DoctorService
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { Doctor } from '../doctor/entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorSchedule, Doctor]),
    forwardRef(() => DoctorModule),
  ],
  controllers: [DoctorScheduleController],
  providers: [DoctorScheduleService],
  exports: [DoctorScheduleService],
})
export class DoctorScheduleModule {}
