import { Injectable } from '@nestjs/common';
import { DoctorService } from '../doctor/doctor.service';
import { VetClinicService } from '../vet-clinic/vet-clinic.service';
import { Doctor } from '../doctor/entities/doctor.entity';
import { VetClinic } from '../vet-clinic/entities/vet-clinic.entity';

export interface UnifiedSearchResult {
  doctors: Doctor[];
  clinics: VetClinic[];
  totalDoctors: number;
  totalClinics: number;
  totalResults: number;
}

export enum SearchType {
  ALL = 'all',
  DOCTORS = 'doctors',
  CLINICS = 'clinics',
}

@Injectable()
export class SearchService {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly vetClinicService: VetClinicService,
  ) {}

  async searchAll(query: string): Promise<UnifiedSearchResult> {
    if (!query || query.trim().length === 0) {
      return {
        doctors: [],
        clinics: [],
        totalDoctors: 0,
        totalClinics: 0,
        totalResults: 0,
      };
    }

    const [doctors, clinics] = await Promise.all([
      this.doctorService.searchDoctors(query),
      this.vetClinicService.searchClinics(query),
    ]);

    return {
      doctors,
      clinics,
      totalDoctors: doctors.length,
      totalClinics: clinics.length,
      totalResults: doctors.length + clinics.length,
    };
  }

  async searchDoctorsOnly(query: string): Promise<Doctor[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return this.doctorService.searchDoctors(query);
  }

  async searchClinicsOnly(query: string): Promise<VetClinic[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return this.vetClinicService.searchClinics(query);
  }

  async searchByType(
    query: string,
    type: SearchType,
  ): Promise<UnifiedSearchResult> {
    switch (type) {
      case SearchType.DOCTORS:
        const doctors = await this.searchDoctorsOnly(query);
        return {
          doctors,
          clinics: [],
          totalDoctors: doctors.length,
          totalClinics: 0,
          totalResults: doctors.length,
        };
      case SearchType.CLINICS: {
        const clinics = await this.searchClinicsOnly(query);
        return {
          clinics,
          doctors: [],
          totalDoctors: 0,
          totalClinics: clinics.length,
          totalResults: clinics.length,
        };
      }
      case SearchType.ALL:
      default:
        return this.searchAll(query);
    }
  }
}
