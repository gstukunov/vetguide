import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetClinic } from './entities/vet-clinic.entity';
import { VetClinicService } from './vet-clinic.service';
import { VetClinicController } from './vet-clinic.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VetClinic]),
    forwardRef(() => AuthModule),
  ],
  controllers: [VetClinicController],
  providers: [VetClinicService],
  exports: [VetClinicService],
})
export class VetClinicModule {}
