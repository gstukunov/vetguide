import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { UserModule } from '../user/user.module';
import { DoctorModule } from '../doctor/doctor.module';
import { User } from '../user/entities/user.entity';
import { Doctor } from '../doctor/entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User, Doctor]),
    forwardRef(() => UserModule),
    forwardRef(() => DoctorModule),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
