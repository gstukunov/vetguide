import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateDoctorScheduleDto,
  UpdateDoctorScheduleDto,
} from './dto/doctor-schedule.dto';
import { Doctor } from '../doctor/entities/doctor.entity';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
@Injectable()
export class DoctorScheduleService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private scheduleRepo: Repository<DoctorSchedule>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async createSchedule(
    doctorId: string,
    dto: CreateDoctorScheduleDto,
  ): Promise<DoctorSchedule> {
    const doctor = await this.doctorRepo.findOne({
      where: { id: doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const schedule = this.scheduleRepo.create({ ...dto, doctor });
    return this.scheduleRepo.save(schedule);
  }

  async updateSchedule(
    id: string,
    dto: UpdateDoctorScheduleDto,
  ): Promise<DoctorSchedule> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    return this.scheduleRepo.save({ ...schedule, ...dto });
  }

  async getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]> {
    return this.scheduleRepo.find({
      where: { doctor: { id: doctorId } },
      relations: ['doctor'],
    });
  }
}
