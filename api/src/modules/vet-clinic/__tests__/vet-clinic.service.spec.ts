import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetClinicService } from '../vet-clinic.service';
import { VetClinic } from '../entities/vet-clinic.entity';
import { CreateVetClinicDto } from '../dto/create-vet-clinic.dto';

describe('VetClinicService', () => {
  let service: VetClinicService;
  let clinicRepository: Repository<VetClinic>;

  const mockVetClinic = {
    id: 'V1StGXR8_Z5jdHi6B-myT',
    name: 'Тестовая ветеринарная клиника',
    address: 'Тестовый адрес, 123',
    inn: '1234567890',
    description: 'Тестовое описание клиники',
    doctors: [],
    phone: '1234567890',
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VetClinicService,
        {
          provide: getRepositoryToken(VetClinic),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VetClinicService>(VetClinicService);
    clinicRepository = module.get<Repository<VetClinic>>(
      getRepositoryToken(VetClinic),
    );
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('должен создать ветеринарную клинику', async () => {
      const createDto: CreateVetClinicDto = {
        name: 'Тестовая ветеринарная клиника',
        address: 'Тестовый адрес, 123',
        inn: '1234567890',
        description: 'Тестовое описание клиники',
      };

      jest.spyOn(clinicRepository, 'create').mockReturnValue(mockVetClinic);
      jest.spyOn(clinicRepository, 'save').mockResolvedValue(mockVetClinic);

      const result = await service.create(createDto);

      expect(result).toEqual(mockVetClinic);
      expect(clinicRepository.create).toHaveBeenCalledWith(createDto);
      expect(clinicRepository.save).toHaveBeenCalledWith(mockVetClinic);
    });
  });

  describe('findOne', () => {
    it('должен найти клинику по ID', async () => {
      jest.spyOn(clinicRepository, 'findOne').mockResolvedValue(mockVetClinic);

      const result = await service.findOne('V1StGXR8_Z5jdHi6B-myT');

      expect(result).toEqual(mockVetClinic);
      expect(clinicRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'V1StGXR8_Z5jdHi6B-myT' },
      });
    });

    it('должен выбросить ошибку, если клиника не найдена', async () => {
      jest.spyOn(clinicRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('V999StGXR8_Z5jdHi6B-myT')).rejects.toThrow(
        'Vet clinic with ID V999StGXR8_Z5jdHi6B-myT not found',
      );
    });
  });

  describe('searchClinics', () => {
    it('должен найти клиники по запросу', async () => {
      const query = 'ветеринарная клиника';
      const searchResult = [mockVetClinic];

      jest.spyOn(clinicRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(searchResult),
      } as any);

      const result = await service.searchClinics(query);

      expect(result).toEqual(searchResult);
    });

    it('должен вернуть пустой массив для пустого запроса', async () => {
      const result = await service.searchClinics('');

      expect(result).toEqual([]);
    });
  });

  describe('searchClinicsByAddress', () => {
    it('должен найти клиники по адресу', async () => {
      const address = 'Москва';
      const searchResult = [mockVetClinic];

      jest.spyOn(clinicRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(searchResult),
      } as any);

      const result = await service.searchClinicsByAddress(address);

      expect(result).toEqual(searchResult);
    });

    it('должен вернуть пустой массив для пустого адреса', async () => {
      const result = await service.searchClinicsByAddress('');

      expect(result).toEqual([]);
    });
  });
});
