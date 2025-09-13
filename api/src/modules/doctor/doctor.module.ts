import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { VetClinicModule } from '../vet-clinic/vet-clinic.module';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { DoctorScheduleModule } from '../doctor-schedule/doctor-schedule.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor]),
    VetClinicModule,
    AuthModule,
    forwardRef(() => DoctorScheduleModule),
    forwardRef(() => UserModule),
    S3Module,
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}
