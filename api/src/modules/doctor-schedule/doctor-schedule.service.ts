import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  CreateDoctorScheduleDto,
  UpdateDoctorScheduleDto,
  BulkCreateDoctorScheduleDto,
  GetDoctorScheduleDto,
} from './dto/doctor-schedule.dto';
import { Doctor } from '../doctor/entities/doctor.entity';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import {
  ScheduleData,
  WeekSchedule,
  DaySchedule,
  TimeSlot,
} from './types/schedule-types';

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

    // Check if schedule already exists for this date and time
    const existingSchedule = await this.scheduleRepo.findOne({
      where: {
        doctor: { id: doctorId },
        date: dto.date,
        timeSlot: dto.timeSlot,
      },
    });

    if (existingSchedule) {
      throw new BadRequestException(
        'Schedule already exists for this date and time',
      );
    }

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

  async bulkCreateSchedule(
    doctorId: string,
    dto: BulkCreateDoctorScheduleDto,
  ): Promise<DoctorSchedule[]> {
    const doctor = await this.doctorRepo.findOne({
      where: { id: doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const schedules: DoctorSchedule[] = [];
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Generate dates for each day of week in the range
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay();

      if (dto.daysOfWeek.includes(dayOfWeek)) {
        for (const timeSlot of dto.timeSlots) {
          const scheduleDate = date.toISOString().split('T')[0];

          // Check if schedule already exists
          const existingSchedule = await this.scheduleRepo.findOne({
            where: {
              doctor: { id: doctorId },
              date: scheduleDate,
              timeSlot: timeSlot,
            },
          });

          if (!existingSchedule) {
            const schedule = this.scheduleRepo.create({
              doctor,
              date: scheduleDate,
              timeSlot,
              isAvailable: true,
            });
            schedules.push(schedule);
          }
        }
      }
    }

    return this.scheduleRepo.save(schedules);
  }

  async getDoctorSchedules(
    doctorId: string,
    query?: GetDoctorScheduleDto,
  ): Promise<DoctorSchedule[]> {
    const whereCondition: any = { doctor: { id: doctorId } };

    if (query?.startDate && query?.endDate) {
      whereCondition.date = Between(query.startDate, query.endDate);
    } else if (query?.weeks) {
      // If weeks is specified, get schedules for the next N weeks
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + query.weeks * 7);

      whereCondition.date = Between(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
      );
    }

    return this.scheduleRepo.find({
      where: whereCondition,
      relations: ['doctor'],
      order: { date: 'ASC', timeSlot: 'ASC' },
    });
  }

  async getScheduleForUI(
    doctorId: string,
    weeks: number = 4,
  ): Promise<ScheduleData> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + weeks * 7);

    const schedules = await this.getDoctorSchedules(doctorId, {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });

    // Group schedules by date
    const schedulesByDate = new Map<string, DoctorSchedule[]>();
    schedules.forEach((schedule) => {
      if (!schedulesByDate.has(schedule.date)) {
        schedulesByDate.set(schedule.date, []);
      }
      schedulesByDate.get(schedule.date)!.push(schedule);
    });

    // Generate weeks structure
    const weeksData: Array<WeekSchedule> = [];
    let currentWeekIndex = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let weekOffset = 0; weekOffset < weeks; weekOffset++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + weekOffset * 7);

      const weekNumber = Math.ceil(
        (weekStart.getTime() -
          new Date(weekStart.getFullYear(), 0, 1).getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      );

      const days: Array<DaySchedule> = [];

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayOffset);

        const dateStr = date.toISOString().split('T')[0];
        const daySchedules = schedulesByDate.get(dateStr) || [];

        const timeSlots = daySchedules.map((schedule) => ({
          id: schedule.id,
          time: schedule.timeSlot,
          available: schedule.isAvailable,
        }));

        const isToday = date.toDateString() === today.toDateString();
        if (isToday) {
          currentWeekIndex = weekOffset;
        }

        days.push({
          date: new Date(date),
          dayOfWeek: date.toLocaleDateString('ru-RU', { weekday: 'long' }),
          dayOfWeekShort: date.toLocaleDateString('ru-RU', {
            weekday: 'short',
          }),
          dayNumber: date.getDate(),
          isToday,
          timeSlots,
        });
      }

      weeksData.push({
        weekNumber,
        days,
      });
    }

    return {
      weeks: weeksData,
      currentWeekIndex,
    };
  }

  async deleteSchedule(id: string): Promise<void> {
    const result = await this.scheduleRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Schedule not found');
    }
  }
}
