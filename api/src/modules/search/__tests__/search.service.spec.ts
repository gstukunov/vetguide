import { Test, TestingModule } from '@nestjs/testing';
import {
  SearchService,
  UnifiedSearchResult,
  SearchType,
} from '../search.service';
import { DoctorService } from '../../doctor/doctor.service';
import { VetClinicService } from '../../vet-clinic/vet-clinic.service';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { VetClinic } from '../../vet-clinic/entities/vet-clinic.entity';

describe('SearchService', () => {
  let service: SearchService;
  let doctorService: DoctorService;
  let vetClinicService: VetClinicService;

  const mockDoctor: Doctor = {
    id: '1',
    photoKey: 'https://example.com/photo.jpg',
    fullName: 'Доктор Иван Иванов',
    photoUrl: 'avatars/doctors/1/uuid.jpeg',
    clinicId: '1',
    description: 'Опытный ветеринар с 10-летним стажем',
    specialization: ['Кардиология', 'Хирургия'],
    clinic: {
      id: '1',
      name: 'Тестовая клиника',
      address: 'Тестовый адрес',
      inn: '1234567890',
      phone: '1234567890',
      description: 'Тестовое описание',
      doctors: [],
      users: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    reviews: [],
    averageRating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClinic: VetClinic = {
    id: '1',
    name: 'Тестовая ветеринарная клиника',
    address: 'Тестовый адрес, 123',
    inn: '1234567890',
    phone: '1234567890',
    description: 'Тестовое описание клиники',
    doctors: [mockDoctor],
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: DoctorService,
          useValue: {
            searchDoctors: jest.fn(),
          },
        },
        {
          provide: VetClinicService,
          useValue: {
            searchClinics: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    doctorService = module.get<DoctorService>(DoctorService);
    vetClinicService = module.get<VetClinicService>(VetClinicService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('searchAll', () => {
    it('должен вернуть комбинированные результаты поиска', async () => {
      const query = 'кардиолог';
      const expectedResult: UnifiedSearchResult = {
        doctors: [mockDoctor],
        clinics: [mockClinic],
        totalDoctors: 1,
        totalClinics: 1,
        totalResults: 2,
      };

      jest
        .spyOn(doctorService, 'searchDoctors')
        .mockResolvedValue([mockDoctor]);
      jest
        .spyOn(vetClinicService, 'searchClinics')
        .mockResolvedValue([mockClinic]);

      const result = await service.searchAll(query);

      expect(result).toEqual(expectedResult);
      expect(doctorService.searchDoctors).toHaveBeenCalledWith(query);
      expect(vetClinicService.searchClinics).toHaveBeenCalledWith(query);
    });

    it('должен вернуть пустые результаты для пустого запроса', async () => {
      const result = await service.searchAll('');

      expect(result).toEqual({
        doctors: [],
        clinics: [],
        totalDoctors: 0,
        totalClinics: 0,
        totalResults: 0,
      });
    });

    it('должен вернуть пустые результаты для запроса только с пробелами', async () => {
      const result = await service.searchAll('   ');

      expect(result).toEqual({
        doctors: [],
        clinics: [],
        totalDoctors: 0,
        totalClinics: 0,
        totalResults: 0,
      });
    });
  });

  describe('searchDoctorsOnly', () => {
    it('должен вернуть только врачей', async () => {
      const query = 'хирург';
      const doctors = [mockDoctor];

      jest.spyOn(doctorService, 'searchDoctors').mockResolvedValue(doctors);

      const result = await service.searchDoctorsOnly(query);

      expect(result).toEqual(doctors);
      expect(doctorService.searchDoctors).toHaveBeenCalledWith(query);
    });

    it('должен вернуть пустой массив для пустого запроса', async () => {
      const result = await service.searchDoctorsOnly('');

      expect(result).toEqual([]);
    });
  });

  describe('searchClinicsOnly', () => {
    it('должен вернуть только клиники', async () => {
      const query = 'ветеринарная клиника';
      const clinics = [mockClinic];

      jest.spyOn(vetClinicService, 'searchClinics').mockResolvedValue(clinics);

      const result = await service.searchClinicsOnly(query);

      expect(result).toEqual(clinics);
      expect(vetClinicService.searchClinics).toHaveBeenCalledWith(query);
    });

    it('должен вернуть пустой массив для пустого запроса', async () => {
      const result = await service.searchClinicsOnly('');

      expect(result).toEqual([]);
    });
  });

  describe('searchByType', () => {
    it('должен вернуть все результаты для типа ALL', async () => {
      const query = 'тест';
      const expectedResult: UnifiedSearchResult = {
        doctors: [mockDoctor],
        clinics: [mockClinic],
        totalDoctors: 1,
        totalClinics: 1,
        totalResults: 2,
      };

      jest.spyOn(service, 'searchAll').mockResolvedValue(expectedResult);

      const result = await service.searchByType(query, SearchType.ALL);

      expect(result).toEqual(expectedResult);
      expect(service.searchAll).toHaveBeenCalledWith(query);
    });

    it('должен вернуть только врачей для типа DOCTORS', async () => {
      const query = 'тест';
      const doctors = [mockDoctor];

      jest.spyOn(service, 'searchDoctorsOnly').mockResolvedValue(doctors);

      const result = await service.searchByType(query, SearchType.DOCTORS);

      expect(result).toEqual({
        doctors,
        clinics: [],
        totalDoctors: 1,
        totalClinics: 0,
        totalResults: 1,
      });
      expect(service.searchDoctorsOnly).toHaveBeenCalledWith(query);
    });

    it('должен вернуть только клиники для типа CLINICS', async () => {
      const query = 'тест';
      const clinics = [mockClinic];

      jest.spyOn(service, 'searchClinicsOnly').mockResolvedValue(clinics);

      const result = await service.searchByType(query, SearchType.CLINICS);

      expect(result).toEqual({
        doctors: [],
        clinics,
        totalDoctors: 0,
        totalClinics: 1,
        totalResults: 1,
      });
      expect(service.searchClinicsOnly).toHaveBeenCalledWith(query);
    });

    it('должен использовать тип ALL по умолчанию', async () => {
      const query = 'тест';
      const expectedResult: UnifiedSearchResult = {
        doctors: [mockDoctor],
        clinics: [mockClinic],
        totalDoctors: 1,
        totalClinics: 1,
        totalResults: 2,
      };

      jest.spyOn(service, 'searchAll').mockResolvedValue(expectedResult);

      const result = await service.searchByType(query, undefined as any);

      expect(result).toEqual(expectedResult);
      expect(service.searchAll).toHaveBeenCalledWith(query);
    });
  });

  describe('Edge cases and error handling', () => {
    it('должен обрабатывать очень длинные запросы', async () => {
      const longQuery = 'a'.repeat(1000);
      const doctors = [mockDoctor];
      const clinics = [mockClinic];

      jest.spyOn(doctorService, 'searchDoctors').mockResolvedValue(doctors);
      jest.spyOn(vetClinicService, 'searchClinics').mockResolvedValue(clinics);

      const result = await service.searchAll(longQuery);

      expect(result.totalResults).toBe(2);
      expect(doctorService.searchDoctors).toHaveBeenCalledWith(longQuery);
      expect(vetClinicService.searchClinics).toHaveBeenCalledWith(longQuery);
    });

    it('должен обрабатывать запросы со специальными символами', async () => {
      const specialQuery = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const doctors: Doctor[] = [];
      const clinics: VetClinic[] = [];

      jest.spyOn(doctorService, 'searchDoctors').mockResolvedValue(doctors);
      jest.spyOn(vetClinicService, 'searchClinics').mockResolvedValue(clinics);

      const result = await service.searchAll(specialQuery);

      expect(result.totalResults).toBe(0);
      expect(doctorService.searchDoctors).toHaveBeenCalledWith(specialQuery);
      expect(vetClinicService.searchClinics).toHaveBeenCalledWith(specialQuery);
    });

    it('должен обрабатывать запросы с Unicode символами', async () => {
      const unicodeQuery = 'Кардиолог 🐾 Ветеринар';
      const doctors = [mockDoctor];
      const clinics: VetClinic[] = [];

      jest.spyOn(doctorService, 'searchDoctors').mockResolvedValue(doctors);
      jest.spyOn(vetClinicService, 'searchClinics').mockResolvedValue(clinics);

      const result = await service.searchAll(unicodeQuery);

      expect(result.totalResults).toBe(1);
      expect(doctorService.searchDoctors).toHaveBeenCalledWith(unicodeQuery);
      expect(vetClinicService.searchClinics).toHaveBeenCalledWith(unicodeQuery);
    });

    it('должен обрабатывать ошибки от DoctorService', async () => {
      const query = 'test';
      const error = new Error('Database error');

      jest.spyOn(doctorService, 'searchDoctors').mockRejectedValue(error);
      jest
        .spyOn(vetClinicService, 'searchClinics')
        .mockResolvedValue([mockClinic]);

      await expect(service.searchAll(query)).rejects.toThrow('Database error');
    });

    it('должен обрабатывать ошибки от VetClinicService', async () => {
      const query = 'test';
      const error = new Error('Database error');

      jest.spyOn(doctorService, 'searchDoctors').mockResolvedValue([mockDoctor]);
      jest
        .spyOn(vetClinicService, 'searchClinics')
        .mockRejectedValue(error);

      await expect(service.searchAll(query)).rejects.toThrow('Database error');
    });

    it('должен корректно обрабатывать пустые результаты от обоих сервисов', async () => {
      const query = 'nonexistent';

      jest.spyOn(doctorService, 'searchDoctors').mockResolvedValue([]);
      jest.spyOn(vetClinicService, 'searchClinics').mockResolvedValue([]);

      const result = await service.searchAll(query);

      expect(result).toEqual({
        doctors: [],
        clinics: [],
        totalDoctors: 0,
        totalClinics: 0,
        totalResults: 0,
      });
    });

    it('должен корректно обрабатывать множественные результаты', async () => {
      const query = 'test';
      const multipleDoctors = [mockDoctor, { ...mockDoctor, id: '2' }];
      const multipleClinics = [mockClinic, { ...mockClinic, id: '2' }];

      jest
        .spyOn(doctorService, 'searchDoctors')
        .mockResolvedValue(multipleDoctors);
      jest
        .spyOn(vetClinicService, 'searchClinics')
        .mockResolvedValue(multipleClinics);

      const result = await service.searchAll(query);

      expect(result.totalDoctors).toBe(2);
      expect(result.totalClinics).toBe(2);
      expect(result.totalResults).toBe(4);
    });

    it('должен корректно обрабатывать null как пустой запрос', async () => {
      const result = await service.searchAll(null as any);

      expect(result).toEqual({
        doctors: [],
        clinics: [],
        totalDoctors: 0,
        totalClinics: 0,
        totalResults: 0,
      });
    });

    it('должен использовать Promise.all для параллельного выполнения поиска', async () => {
      const query = 'test';
      const doctorsSpy = jest
        .spyOn(doctorService, 'searchDoctors')
        .mockResolvedValue([mockDoctor]);
      const clinicsSpy = jest
        .spyOn(vetClinicService, 'searchClinics')
        .mockResolvedValue([mockClinic]);

      await service.searchAll(query);

      expect(doctorsSpy).toHaveBeenCalled();
      expect(clinicsSpy).toHaveBeenCalled();
      // Оба вызова должны произойти
      expect(doctorsSpy.mock.invocationCallOrder[0]).toBeDefined();
      expect(clinicsSpy.mock.invocationCallOrder[0]).toBeDefined();
    });
  });
});
