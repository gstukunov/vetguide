import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { User } from '../user/entities/user.entity';
import { CreateAppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createAppointment(
    userId: string,
    dto: CreateAppointmentDto,
  ): Promise<Appointment> {
    // Проверяем существование пользователя
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем существование врача
    const doctor = await this.doctorRepo.findOne({
      where: { id: dto.doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Проверяем, не занят ли уже этот слот
    const existingAppointment = await this.appointmentRepo.findOne({
      where: {
        doctorId: dto.doctorId,
        date: dto.date,
        timeSlot: dto.timeSlot,
        status: 'CONFIRMED',
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('This time slot is already booked');
    }

    // Проверяем, не имеет ли пользователь уже запись на этот слот
    const userAppointment = await this.appointmentRepo.findOne({
      where: {
        user_id: userId,
        doctorId: dto.doctorId,
        date: dto.date,
        timeSlot: dto.timeSlot,
        status: 'CONFIRMED',
      },
    });

    if (userAppointment) {
      throw new BadRequestException(
        'You already have an appointment for this time slot',
      );
    }

    // Проверяем, что дата не в прошлом
    const appointmentDate = new Date(dto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      throw new BadRequestException('Cannot create appointment in the past');
    }

    // Создаем запись
    const appointment = this.appointmentRepo.create({
      user_id: userId,
      doctorId: dto.doctorId,
      date: dto.date,
      timeSlot: dto.timeSlot,
      status: 'CONFIRMED',
    });

    return this.appointmentRepo.save(appointment);
  }

  async cancelAppointment(
    appointmentId: string,
    userId: string,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['user', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Проверяем, что пользователь может отменить только свою запись
    if (appointment.user_id !== userId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    // Проверяем, что запись еще не отменена
    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('Appointment is already cancelled');
    }

    appointment.status = 'CANCELLED';
    return this.appointmentRepo.save(appointment);
  }

  async getUserAppointments(userId: string): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      where: { user_id: userId },
      relations: ['doctor', 'doctor.clinic'],
      order: { date: 'ASC', timeSlot: 'ASC' },
    });
  }

  async getDoctorAppointments(
    doctorId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Appointment[]> {
    const whereCondition: any = {
      doctorId,
      status: 'CONFIRMED',
    };

    if (startDate && endDate) {
      whereCondition.date = Between(startDate, endDate);
    }

    return this.appointmentRepo.find({
      where: whereCondition,
      relations: ['user'],
      order: { date: 'ASC', timeSlot: 'ASC' },
    });
  }
}
