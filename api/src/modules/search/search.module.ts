import { Module } from '@nestjs/common';
import { DoctorModule } from '../doctor/doctor.module';
import { VetClinicModule } from '../vet-clinic/vet-clinic.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [DoctorModule, VetClinicModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
