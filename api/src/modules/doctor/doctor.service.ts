import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { VetClinicService } from '../vet-clinic/vet-clinic.service';
import { ReviewStatus } from '../review/entities/review.entity';
import { CreateDoctorScheduleDto } from '../doctor-schedule/dto/doctor-schedule.dto';
import { DoctorSchedule } from '../doctor-schedule/entities/doctor-schedule.entity';
import { DoctorScheduleService } from '../doctor-schedule/doctor-schedule.service';
import { S3Service } from '../s3/s3.service';
import { ImageProcessingOptions } from '../s3/interfaces/interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DoctorService {
  private readonly logger = new Logger(DoctorService.name);

  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    private readonly clinicService: VetClinicService,
    @Inject(forwardRef(() => DoctorScheduleService)) // Решаем циклическую зависимость
    private readonly scheduleService: DoctorScheduleService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
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
      relations: ['reviews'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
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

  async getDoctorWithSchedule(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['schedules'], // Загружаем связанное расписание
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
  }

  async addScheduleToDoctor(
    doctorId: string,
    dto: CreateDoctorScheduleDto,
  ): Promise<DoctorSchedule> {
    return this.scheduleService.createSchedule(doctorId, dto);
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
}
