import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorService } from '../doctor.service';
import { Doctor } from '../entities/doctor.entity';
import { CreateDoctorDto } from '../dto/create-doctor.dto';
import { UpdateDoctorDto } from '../dto/update-doctor.dto';
import { VetClinicService } from '../../vet-clinic/vet-clinic.service';
import { DoctorScheduleService } from '../../doctor-schedule/doctor-schedule.service';
import { S3Service } from '../../s3/s3.service';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../user/types/role.enum';

describe('DoctorService', () => {
  let service: DoctorService;
  let doctorRepo: Repository<Doctor>;
  let clinicService: VetClinicService;
  let scheduleService: DoctorScheduleService;
  let s3Service: S3Service;
  let configService: ConfigService;

  const mockVetClinic = {
    id: 1,
    name: 'Тестовая клиника',
    address: 'Тестовый адрес',
    inn: '1234567890',
    description: 'Тестовое описание',
    doctors: [],
    users: [],
  };

  const mockDoctor = {
    id: 1,
    photoKey: 'avatars/doctors/1/uuid.jpeg',
    fullName: 'Доктор Иван Иванов',
    description: 'Опытный ветеринар с 10-летним стажем',
    specialization: ['Кардиология', 'Хирургия'],
    clinic: mockVetClinic,
    reviews: [],
    schedules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSafeUser = {
    id: 1,
    phone: '+79123456789',
    fullName: 'Доктор Иван Иванов',
    isVerified: true,
    role: UserRole.USER,
    reviews: [],
    clinic: mockVetClinic,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorService,
        {
          provide: getRepositoryToken(Doctor),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: VetClinicService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DoctorScheduleService,
          useValue: {
            createSchedule: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                NODE_ENV: 'development',
                MINIO_ENDPOINT: 'http://localhost:9000',
                MINIO_BUCKET: 'vetguide-images',
                MINIO_REGION: 'us-east-1',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
    doctorRepo = module.get<Repository<Doctor>>(getRepositoryToken(Doctor));
    clinicService = module.get<VetClinicService>(VetClinicService);
    scheduleService = module.get<DoctorScheduleService>(DoctorScheduleService);
    s3Service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('должен создать врача со всеми свойствами', async () => {
      const createDto: CreateDoctorDto = {
        fullName: 'Доктор Иван Иванов',
        description: 'Опытный ветеринар с 10-летним стажем',
        specialization: ['Кардиология', 'Хирургия'],
        clinicId: 1,
      };

      jest.spyOn(clinicService, 'findOne').mockResolvedValue(mockVetClinic);
      jest.spyOn(doctorRepo, 'create').mockReturnValue(mockDoctor);
      jest.spyOn(doctorRepo, 'save').mockResolvedValue(mockDoctor);

      const result = await service.create(createDto);

      expect(result).toEqual(mockDoctor);
      expect(clinicService.findOne).toHaveBeenCalledWith(1);
      expect(doctorRepo.create).toHaveBeenCalledWith({
        fullName: createDto.fullName,
        description: createDto.description,
        photoKey: createDto.photoKey,
        specialization: createDto.specialization,
        clinic: mockVetClinic,
      });
      expect(doctorRepo.save).toHaveBeenCalledWith(mockDoctor);
    });

    it('должен создать врача без необязательных свойств', async () => {
      const createDto: CreateDoctorDto = {
        fullName: 'Доктор Мария Петрова',
        clinicId: 1,
      };

      const doctorWithoutOptional = {
        ...mockDoctor,
        id: 2,
        fullName: 'Доктор Мария Петрова',
        description: '',
        specialization: [],
      };

      jest.spyOn(clinicService, 'findOne').mockResolvedValue(mockVetClinic);
      jest.spyOn(doctorRepo, 'create').mockReturnValue(doctorWithoutOptional);
      jest.spyOn(doctorRepo, 'save').mockResolvedValue(doctorWithoutOptional);

      const result = await service.create(createDto);

      expect(result).toEqual(doctorWithoutOptional);
      expect(doctorRepo.create).toHaveBeenCalledWith({
        fullName: createDto.fullName,
        description: undefined,
        photoKey: undefined,
        specialization: undefined,
        clinic: mockVetClinic,
      });
    });
  });

  describe('update', () => {
    it('должен обновить свойства врача', async () => {
      const updateDto: UpdateDoctorDto = {
        description: 'Обновленное описание',
        specialization: ['Дерматология', 'Кардиология'],
      };

      const updatedDoctor = {
        ...mockDoctor,
        description: 'Обновленное описание',
        specialization: ['Дерматология', 'Кардиология'],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockDoctor);
      jest.spyOn(doctorRepo, 'save').mockResolvedValue(updatedDoctor);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedDoctor);
      expect(doctorRepo.save).toHaveBeenCalledWith(updatedDoctor);
    });

    it('должен обновить клинику, если указан clinicId', async () => {
      const newClinic = { ...mockVetClinic, id: 2, name: 'Новая клиника' };
      const updateDto: UpdateDoctorDto = {
        clinicId: 2,
      };

      const doctorWithNewClinic = {
        ...mockDoctor,
        clinic: newClinic,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockDoctor);
      jest.spyOn(clinicService, 'findOne').mockResolvedValue(newClinic);
      jest.spyOn(doctorRepo, 'save').mockResolvedValue(doctorWithNewClinic);

      const result = await service.update(1, updateDto);

      expect(result.clinic).toEqual(newClinic);
      expect(clinicService.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('searchDoctors', () => {
    it('должен найти врачей по запросу', async () => {
      const query = 'кардиолог';
      const searchResult = [mockDoctor];

      jest.spyOn(doctorRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(searchResult),
      } as any);

      const result = await service.searchDoctors(query);

      expect(result).toEqual([
        {
          ...mockDoctor,
          photoUrl:
            'http://localhost:9000/vetguide-images/avatars/doctors/1/uuid.jpeg',
        },
      ]);
    });

    it('должен вернуть пустой массив для пустого запроса', async () => {
      const result = await service.searchDoctors('');

      expect(result).toEqual([]);
    });
  });

  describe('searchDoctorsBySpecialization', () => {
    it('должен найти врачей по специализации', async () => {
      const specialization = 'хирург';
      const searchResult = [mockDoctor];

      jest.spyOn(doctorRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(searchResult),
      } as any);

      const result =
        await service.searchDoctorsBySpecialization(specialization);

      expect(result).toEqual([
        {
          ...mockDoctor,
          photoUrl:
            'http://localhost:9000/vetguide-images/avatars/doctors/1/uuid.jpeg',
        },
      ]);
    });

    it('должен вернуть пустой массив для пустой специализации', async () => {
      const result = await service.searchDoctorsBySpecialization('');

      expect(result).toEqual([]);
    });
  });

  describe('uploadPhoto', () => {
    it('должен загрузить фото и обновить врача', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const mockUploadResult = {
        key: 'avatars/doctors/1/uuid.jpeg',
        url: 'http://localhost:9000/vetguide-images/avatars/doctors/1/uuid.jpeg',
        thumbnailUrl:
          'http://localhost:9000/vetguide-images/avatars/doctors/1/thumbnails/uuid.jpeg',
        size: 12345,
        mimeType: 'image/jpeg',
      };

      const updatedDoctor = {
        ...mockDoctor,
        photoKey: mockUploadResult.key,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockDoctor);
      jest.spyOn(s3Service, 'uploadImage').mockResolvedValue(mockUploadResult);
      jest.spyOn(doctorRepo, 'save').mockResolvedValue(updatedDoctor);

      const result = await service.uploadPhoto(1, mockFile);

      expect(s3Service.uploadImage).toHaveBeenCalledWith(
        mockFile,
        'avatars/doctors/1',
        {
          maxWidth: 500,
          maxHeight: 500,
          quality: 90,
          format: 'jpeg',
          createThumbnail: true,
          thumbnailSize: 200,
        },
      );
      expect(doctorRepo.save).toHaveBeenCalledWith(updatedDoctor);
      expect(result).toEqual({
        key: mockUploadResult.key,
        url: mockUploadResult.url,
        thumbnailUrl: mockUploadResult.thumbnailUrl,
        doctor: updatedDoctor,
      });
    });

    it('должен получить постоянный URL фото по ключу', () => {
      const photoKey = 'avatars/doctors/1/uuid.jpeg';
      const expectedUrl =
        'http://localhost:9000/vetguide-images/avatars/doctors/1/uuid.jpeg';

      const result = service.getPhotoUrl(photoKey);

      expect(result).toBe(expectedUrl);
    });

    it('должен вернуть null для пустого ключа', () => {
      const result = service.getPhotoUrl('');

      expect(result).toBeNull();
    });
  });
});
