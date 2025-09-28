import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetClinic } from './entities/vet-clinic.entity';
import { CreateVetClinicDto } from './dto/create-vet-clinic.dto';

@Injectable()
export class VetClinicService {
  constructor(
    @InjectRepository(VetClinic)
    private readonly clinicRepository: Repository<VetClinic>,
  ) {}

  async create(createDto: CreateVetClinicDto): Promise<VetClinic> {
    const clinic = this.clinicRepository.create(createDto);
    return this.clinicRepository.save(clinic);
  }

  async findOne(id: string): Promise<VetClinic> {
    const clinic = await this.clinicRepository.findOne({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException(`Vet clinic with ID ${id} not found`);
    }

    return clinic;
  }

  async searchClinics(query: string): Promise<VetClinic[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;

    return this.clinicRepository
      .createQueryBuilder('clinic')
      .leftJoinAndSelect('clinic.doctors', 'doctors')
      .leftJoinAndSelect('clinic.users', 'users')
      .where(
        'clinic.name ILIKE :searchTerm OR ' +
          'clinic.address ILIKE :searchTerm OR ' +
          'clinic.description ILIKE :searchTerm',
        { searchTerm },
      )
      .orWhere('doctors.fullName ILIKE :searchTerm')
      .orWhere('doctors.specialization::text ILIKE :searchTerm')
      .orderBy('clinic.name', 'ASC')
      .getMany();
  }

  async searchClinicsByAddress(address: string): Promise<VetClinic[]> {
    if (!address || address.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${address.trim()}%`;

    return this.clinicRepository
      .createQueryBuilder('clinic')
      .leftJoinAndSelect('clinic.doctors', 'doctors')
      .leftJoinAndSelect('clinic.users', 'users')
      .where('clinic.address ILIKE :searchTerm', { searchTerm })
      .orderBy('clinic.name', 'ASC')
      .getMany();
  }
}
