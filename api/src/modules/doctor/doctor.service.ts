import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { VetClinicService } from '../vet-clinic/vet-clinic.service';
import { ReviewStatus } from '../review/entities/review.entity';
import {
  ScheduleData,
  WeekSchedule,
  DaySchedule,
} from './types/schedule-types';
import { S3Service } from '../s3/s3.service';
import { ImageProcessingOptions } from '../s3/interfaces/interfaces';
import { ConfigService } from '@nestjs/config';
import { Appointment } from '../appointment/entities/appointment.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class DoctorService {
  private readonly logger = new Logger(DoctorService.name);

  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    private readonly clinicService: VetClinicService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async create(createDto: CreateDoctorDto): Promise<Doctor> {
    const clinic = await this.clinicService.findOne(createDto.clinicId);
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    const doctor = this.doctorRepo.create({
      fullName: createDto.fullName,
      description: createDto.description,
      photoKey: createDto.photoKey,
      specialization: createDto.specialization,
      clinic,
    });

    return this.doctorRepo.save(doctor);
  }

  async update(id: string, updateDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);

    if (updateDto.clinicId && updateDto.clinicId !== doctor.clinic.id) {
      const newClinic = await this.clinicService.findOne(updateDto.clinicId);
      if (!newClinic) {
        throw new NotFoundException('New clinic not found');
      }
      doctor.clinic = newClinic;
    }

    if (updateDto.fullName !== undefined) {
      doctor.fullName = updateDto.fullName;
    }

    if (updateDto.description !== undefined) {
      doctor.description = updateDto.description;
    }

    if (updateDto.specialization !== undefined) {
      doctor.specialization = updateDto.specialization;
    }

    if (updateDto.photoKey !== undefined) {
      doctor.photoKey = updateDto.photoKey;
    }

    return this.doctorRepo.save(doctor);
  }

  async uploadPhoto(
    doctorId: string,
    file: Express.Multer.File,
  ): Promise<{
    url: string;
    key: string;
    thumbnailUrl?: string;
    doctor: Doctor;
  }> {
    const doctor = await this.findOne(doctorId);

    const folder = `avatars/doctors/${doctorId}`;
    const options: ImageProcessingOptions = {
      maxWidth: 500,
      maxHeight: 500,
      quality: 90,
      format: 'jpeg',
      createThumbnail: true,
      thumbnailSize: 200,
    };

    const result = await this.s3Service.uploadImage(file, folder, options);
    doctor.photoKey = result.key;
    await this.doctorRepo.save(doctor);

    return {
      key: result.key,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      doctor,
    };
  }

  getPhotoUrl(photoKey: string): string | null {
    if (!photoKey) {
      return null;
    }

    // Для постоянных публичных фото используем статические URL
    const isLocal = this.configService.get('NODE_ENV') === 'development';
    const minioEndpoint: string | undefined =
      this.configService.get('MINIO_ENDPOINT');

    if (isLocal && minioEndpoint) {
      // MinIO в development - публичный URL
      const bucketName: string | undefined =
        this.configService.get('MINIO_BUCKET');
      return `${minioEndpoint}/${bucketName}/${photoKey}`;
    } else if (isLocal && !minioEndpoint) {
      // Локальное хранилище
      return `/uploads/${photoKey}`;
    } else if (minioEndpoint) {
      // MinIO в production - публичный URL
      const bucketName: string | undefined =
        this.configService.get('MINIO_BUCKET');
      return `${minioEndpoint}/${bucketName}/${photoKey}`;
    }

    return null;
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['reviews', 'clinic'],
    });
    const filteredReviews = doctor?.reviews.filter((review) => review.status === 'VERIFIED') || [];
    const reviewAuthorsReq = filteredReviews.map((review) => this.userService.findById(review.userId));

    const reviewsAuthors = await Promise.allSettled(reviewAuthorsReq).then((author) => author.filter((val) => val.status === 'fulfilled'));

    const reviews = filteredReviews.reduce((prev, curr) => {
      const author = reviewsAuthors.find((author) => author.value.id === curr.userId)?.value
      
      return [
        ...prev, 
        { 
          id: curr.id, 
          description: curr.description, 
          rating: curr.rating, 
          status: curr.status,
          createdAt: curr.createdAt,
          user: { fullName: author?.fullName,  }
        }
      ];
    }, new Array())

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return {...doctor, reviews: reviews};
  }

  // Расчет среднего рейтинга
  async calculateAverageRating(doctorId: string): Promise<number> {
    const doctor = await this.findOne(doctorId);

    if (!doctor.reviews || doctor.reviews.length === 0) return 0;

    const verifiedReviews = doctor.reviews.filter(
      (r) => r.status === ReviewStatus.VERIFIED,
    );

    if (verifiedReviews.length === 0) return 0;

    const total = verifiedReviews.reduce((sum, r) => sum + r.rating, 0);
    return total / verifiedReviews.length;
  }

  async isDoctorBelongsToClinic(
    doctorId: string,
    clinicId: string,
  ): Promise<boolean> {
    const doctor = await this.doctorRepo.findOne({
      where: { id: doctorId },
      relations: ['clinic'],
    });
    return doctor?.clinic?.id === clinicId;
  }

  async getScheduleForUI(
    doctorId: string,
    weeks: number = 4,
    currentUserId?: string,
  ): Promise<ScheduleData> {
    // Проверяем существование врача
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Устанавливаем начало дня для корректного сравнения дат
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + weeks * 7);

    // Форматируем даты в формат YYYY-MM-DD
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Получаем все подтвержденные записи для врача в указанном периоде
    const appointments = await this.appointmentRepo.find({
      where: {
        doctorId,
        date: Between(startDateStr, endDateStr),
        status: 'CONFIRMED',
      },
      select: ['date', 'timeSlot', 'user_id'],
      order: { date: 'ASC', timeSlot: 'ASC' },
    });

    // Группируем записи по датам и отслеживаем, какие из них принадлежат текущему пользователю
    const appointmentsByDate = new Map<string, Set<string>>();
    const userAppointmentsByDate = new Map<string, Set<string>>();

    appointments.forEach((appointment) => {
      const date = String(appointment.date).split('T')[0];

      // Общая карта всех занятых слотов
      if (!appointmentsByDate.has(date)) {
        appointmentsByDate.set(date, new Set());
      }
      appointmentsByDate.get(date)!.add(appointment.timeSlot);

      // Карта слотов, забронированных текущим пользователем (если пользователь авторизован)
      if (currentUserId && appointment.user_id === currentUserId) {
        if (!userAppointmentsByDate.has(date)) {
          userAppointmentsByDate.set(date, new Set());
        }
        userAppointmentsByDate.get(date)!.add(appointment.timeSlot);
      }
    });

    // Генерируем временные слоты (по умолчанию 9:00-18:00 с шагом 1 час)
    // В будущем можно вынести это в настройки врача
    const workStartHour = 9;
    const workEndHour = 18;
    const timeSlots: string[] = [];
    for (let hour = workStartHour; hour < workEndHour; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

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
        date.setHours(0, 0, 0, 0); // Обнуляем время для корректного сравнения

        const dateStr = date.toISOString().split('T')[0];

        // Получаем занятые слоты для этой даты
        const bookedSlots = appointmentsByDate.get(dateStr) || new Set();
        const userBookedSlots =
          userAppointmentsByDate.get(dateStr) || new Set();

        // Генерируем слоты для этого дня
        const dayTimeSlots = timeSlots.map((timeSlot) => {
          const isBooked = bookedSlots.has(timeSlot);
          const isBookedByCurrentUser = currentUserId
            ? userBookedSlots.has(timeSlot)
            : false;
          return {
            id: `${doctorId}-${dateStr}-${timeSlot}`, // Генерируем уникальный ID
            time: timeSlot,
            available: !isBooked,
            bookedByCurrentUser: isBookedByCurrentUser || undefined, // Добавляем флаг только если true
          };
        });

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
          timeSlots: dayTimeSlots,
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

  async searchDoctors(query: string): Promise<Doctor[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;

    const doctors = await this.doctorRepo
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.clinic', 'clinic')
      .leftJoinAndSelect('doctor.reviews', 'reviews')
      .where(
        'doctor.fullName ILIKE :searchTerm OR ' +
          'doctor.description ILIKE :searchTerm OR ' +
          'doctor.specialization::text ILIKE :searchTerm',
        { searchTerm },
      )
      .orWhere('clinic.name ILIKE :searchTerm')
      .orWhere('clinic.address ILIKE :searchTerm')
      .orderBy('doctor.fullName', 'ASC')
      .getMany();

    // Добавляем photoUrl для каждого доктора
    return doctors.map((doctor) => ({
      ...doctor,
      photoUrl: this.getPhotoUrl(doctor.photoKey),
    }));
  }

  async searchDoctorsBySpecialization(
    specialization: string,
  ): Promise<Doctor[]> {
    if (!specialization || specialization.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${specialization.trim()}%`;

    const doctors = await this.doctorRepo
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.clinic', 'clinic')
      .leftJoinAndSelect('doctor.reviews', 'reviews')
      .where('doctor.specialization::text ILIKE :searchTerm', { searchTerm })
      .orderBy('doctor.fullName', 'ASC')
      .getMany();

    // Добавляем photoUrl для каждого доктора
    return doctors.map((doctor) => ({
      ...doctor,
      photoUrl: this.getPhotoUrl(doctor.photoKey),
    }));
  }

  async getTopDoctors(params: {
    limit?: number;
    minRating?: number;
    specialization?: string;
    clinicId?: string;
  }): Promise<Doctor[]> {
    try {
      const { limit = 10, minRating, specialization, clinicId } = params;

      let query = this.doctorRepo
        .createQueryBuilder('doctor')
        .leftJoinAndSelect('doctor.clinic', 'clinic')
        .leftJoinAndSelect('doctor.reviews', 'reviews');

      // Фильтр по специализации
      if (specialization && specialization.trim()) {
        const searchTerm = `%${specialization.trim()}%`;
        query = query.andWhere(
          'doctor.specialization::text ILIKE :searchTerm',
          {
            searchTerm,
          },
        );
      }

      // Фильтр по клинике
      if (clinicId) {
        query = query.andWhere('doctor.clinic.id = :clinicId', { clinicId });
      }

      // Получаем всех докторов
      const doctors = await query.getMany();

      // Рассчитываем средний рейтинг и добавляем photoUrl для каждого доктора
      const doctorsWithRating = doctors.map((doctor) => {
        // Проверяем, что reviews существует и является массивом
        const reviews = doctor.reviews || [];
        const verifiedReviews = reviews.filter(
          (review) => review.status === ReviewStatus.VERIFIED,
        );

        let averageRating = 0;
        if (verifiedReviews.length > 0) {
          const totalRating = verifiedReviews.reduce(
            (sum, review) => sum + review.rating,
            0,
          );
          averageRating = totalRating / verifiedReviews.length;
        }

        return {
          ...doctor,
          averageRating,
          reviewCount: verifiedReviews.length,
          photoUrl: this.getPhotoUrl(doctor.photoKey),
        };
      });

      // Фильтруем по минимальному рейтингу
      let filteredDoctors = doctorsWithRating;
      if (minRating !== undefined) {
        filteredDoctors = doctorsWithRating.filter(
          (doctor) => doctor.averageRating >= minRating,
        );
      }

      // Сортируем по рейтингу (от лучшего к худшему), затем по количеству отзывов
      filteredDoctors.sort((a, b) => {
        // Сначала по рейтингу (убывание)
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        // Затем по количеству отзывов (убывание)
        return b.reviewCount - a.reviewCount;
      });

      // Возвращаем только указанное количество
      return filteredDoctors.slice(0, limit);
    } catch (error) {
      this.logger.error(`Ошибка при получении топ докторов: ${error.message}`);
      throw error;
    }
  }

  async getDoctorWithClinic(id: string): Promise<Doctor> {
    const doctor = await this.findOne(id);
    const clinic = await this.clinicService.findOne(doctor.clinicId);
    return {
      ...doctor,
      clinic,
    };
  }

  async getBookedTimeslots(
    doctorId: string,
    currentUserId?: string,
  ): Promise<
    Array<{
      date: string;
      timeSlot: string;
      bookedByCurrentUser?: boolean;
    }>
  > {
    const appointments = await this.appointmentRepo.find({
      where: {
        doctorId,
        status: 'CONFIRMED',
      },
      select: ['date', 'timeSlot', 'user_id'],
      order: { date: 'ASC', timeSlot: 'ASC' },
    });

    return appointments.map((appointment) => ({
      date: String(appointment.date).split('T')[0], // Ensure format is YYYY-MM-DD
      timeSlot: appointment.timeSlot,
      bookedByCurrentUser:
        currentUserId && appointment.user_id === currentUserId
          ? true
          : undefined,
    }));
  }
}
