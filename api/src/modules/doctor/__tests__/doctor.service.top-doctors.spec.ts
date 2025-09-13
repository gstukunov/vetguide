import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorService } from '../doctor.service';
import { Doctor } from '../entities/doctor.entity';
import { VetClinicService } from '../../vet-clinic/vet-clinic.service';
import { DoctorScheduleService } from '../../doctor-schedule/doctor-schedule.service';
import { S3Service } from '../../s3/s3.service';
import { ConfigService } from '@nestjs/config';
import { ReviewStatus } from '../../review/entities/review.entity';

describe('DoctorService - Top Doctors', () => {
  let service: DoctorService;
  let doctorRepository: Repository<Doctor>;

  const mockDoctorRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockVetClinicService = {
    findOne: jest.fn(),
  };

  const mockDoctorScheduleService = {
    createSchedule: jest.fn(),
  };

  const mockS3Service = {
    uploadImage: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config = {
        NODE_ENV: 'development',
        MINIO_ENDPOINT: 'http://localhost:9000',
        MINIO_BUCKET: 'vetguide-images',
        MINIO_REGION: 'us-east-1',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorService,
        {
          provide: getRepositoryToken(Doctor),
          useValue: mockDoctorRepository,
        },
        {
          provide: VetClinicService,
          useValue: mockVetClinicService,
        },
        {
          provide: DoctorScheduleService,
          useValue: mockDoctorScheduleService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
    doctorRepository = module.get<Repository<Doctor>>(
      getRepositoryToken(Doctor),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopDoctors', () => {
    it('должен возвращать топ докторов, отсортированных по рейтингу', async () => {
      // Подготовка тестовых данных
      const mockDoctors = [
        {
          id: 1,
          fullName: 'Доктор Иванов',
          specialization: ['терапевт'],
          reviews: [
            { id: 1, rating: 5, status: ReviewStatus.VERIFIED },
            { id: 2, rating: 4, status: ReviewStatus.VERIFIED },
          ],
          clinic: { id: 1, name: 'Клиника 1' },
        },
        {
          id: 2,
          fullName: 'Доктор Петров',
          specialization: ['хирург'],
          reviews: [
            { id: 3, rating: 5, status: ReviewStatus.VERIFIED },
            { id: 4, rating: 5, status: ReviewStatus.VERIFIED },
            { id: 5, rating: 4, status: ReviewStatus.VERIFIED },
          ],
          clinic: { id: 1, name: 'Клиника 1' },
        },
        {
          id: 3,
          fullName: 'Доктор Сидоров',
          specialization: ['терапевт'],
          reviews: [{ id: 6, rating: 3, status: ReviewStatus.VERIFIED }],
          clinic: { id: 2, name: 'Клиника 2' },
        },
      ];

      // Настройка мока
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockDoctors),
      };

      mockDoctorRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Выполнение теста
      const result = await service.getTopDoctors({ limit: 10 });

      // Проверки
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(2); // Доктор Петров с рейтингом 4.67
      expect(result[1].id).toBe(1); // Доктор Иванов с рейтингом 4.5
      expect(result[2].id).toBe(3); // Доктор Сидоров с рейтингом 3.0

      // Проверяем, что рейтинги рассчитаны правильно
      expect(result[0].averageRating).toBeCloseTo(4.67, 2);
      expect(result[1].averageRating).toBeCloseTo(4.5, 2);
      expect(result[2].averageRating).toBe(3.0);
    });

    it('должен фильтровать по минимальному рейтингу', async () => {
      const mockDoctors = [
        {
          id: 1,
          fullName: 'Доктор Иванов',
          specialization: ['терапевт'],
          reviews: [
            { id: 1, rating: 5, status: ReviewStatus.VERIFIED },
            { id: 2, rating: 4, status: ReviewStatus.VERIFIED },
          ],
          clinic: { id: 1, name: 'Клиника 1' },
        },
        {
          id: 2,
          fullName: 'Доктор Петров',
          specialization: ['хирург'],
          reviews: [{ id: 3, rating: 2, status: ReviewStatus.VERIFIED }],
          clinic: { id: 1, name: 'Клиника 1' },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockDoctors),
      };

      mockDoctorRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTopDoctors({
        limit: 10,
        minRating: 4.0,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].averageRating).toBe(4.5);
    });

    it('должен ограничивать количество возвращаемых докторов', async () => {
      const mockDoctors = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        fullName: `Доктор ${i + 1}`,
        specialization: ['терапевт'],
        reviews: [{ id: i + 1, rating: 5, status: ReviewStatus.VERIFIED }],
        clinic: { id: 1, name: 'Клиника 1' },
      }));

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockDoctors),
      };

      mockDoctorRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTopDoctors({ limit: 5 });

      expect(result).toHaveLength(5);
    });

    it('должен фильтровать по специализации', async () => {
      const mockDoctors = [
        {
          id: 1,
          fullName: 'Доктор Иванов',
          specialization: ['терапевт'],
          reviews: [{ id: 1, rating: 5, status: ReviewStatus.VERIFIED }],
          clinic: { id: 1, name: 'Клиника 1' },
        },
        {
          id: 2,
          fullName: 'Доктор Петров',
          specialization: ['хирург'],
          reviews: [{ id: 2, rating: 5, status: ReviewStatus.VERIFIED }],
          clinic: { id: 1, name: 'Клиника 1' },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockDoctors),
      };

      mockDoctorRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTopDoctors({
        limit: 10,
        specialization: 'хирург',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'doctor.specialization::text ILIKE :searchTerm',
        { searchTerm: '%хирург%' },
      );
    });

    it('должен обрабатывать докторов без отзывов', async () => {
      const mockDoctors = [
        {
          id: 1,
          fullName: 'Доктор без отзывов',
          specialization: ['терапевт'],
          reviews: null, // Доктор без отзывов
          clinic: { id: 1, name: 'Клиника 1' },
        },
        {
          id: 2,
          fullName: 'Доктор с отзывами',
          specialization: ['хирург'],
          reviews: [{ id: 1, rating: 5, status: ReviewStatus.VERIFIED }],
          clinic: { id: 1, name: 'Клиника 1' },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockDoctors),
      };

      mockDoctorRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTopDoctors({ limit: 10 });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2); // Доктор с отзывами должен быть первым
      expect(result[1].id).toBe(1); // Доктор без отзывов должен быть вторым
      expect((result[1] as any).averageRating).toBe(0);
      expect((result[1] as any).reviewCount).toBe(0);
    });
  });
});
