import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import {
  SearchService,
  UnifiedSearchResult,
  SearchType,
} from './search.service';
import { SearchDto } from './dto/search.dto';
import { Doctor } from '../doctor/entities/doctor.entity';
import { VetClinic } from '../vet-clinic/entities/vet-clinic.entity';

@ApiTags('Поиск')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Универсальный поиск',
    description:
      'Поиск по всем сущностям (врачи и клиники) с возможностью фильтрации по типу',
  })
  @ApiQuery({
    name: 'query',
    description: 'Поисковый запрос',
    example: 'кардиолог',
    required: true,
  })
  @ApiQuery({
    name: 'type',
    description: 'Тип поиска',
    enum: SearchType,
    required: false,
    example: SearchType.ALL,
  })
  @ApiResponse({
    status: 200,
    description: 'Результаты поиска',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            doctors: {
              type: 'array',
              items: { $ref: '#/components/schemas/Doctor' },
            },
            clinics: {
              type: 'array',
              items: { $ref: '#/components/schemas/VetClinic' },
            },
            totalDoctors: { type: 'number' },
            totalClinics: { type: 'number' },
            totalResults: { type: 'number' },
          },
        },
        {
          type: 'array',
          items: { $ref: '#/components/schemas/Doctor' },
        },
        {
          type: 'array',
          items: { $ref: '#/components/schemas/VetClinic' },
        },
      ],
    },
  })
  async search(
    @Query() searchDto: SearchDto,
  ): Promise<UnifiedSearchResult | Doctor[] | VetClinic[]> {
    const { query, type = SearchType.ALL } = searchDto;
    return this.searchService.searchByType(query, type);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Поиск по всем сущностям',
    description: 'Поиск по врачам и клиникам одновременно',
  })
  @ApiQuery({
    name: 'query',
    description: 'Поисковый запрос',
    example: 'ветеринар',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Комбинированные результаты поиска',
    schema: {
      type: 'object',
      properties: {
        doctors: {
          type: 'array',
          items: { $ref: '#/components/schemas/Doctor' },
        },
        clinics: {
          type: 'array',
          items: { $ref: '#/components/schemas/VetClinic' },
        },
        totalDoctors: { type: 'number' },
        totalClinics: { type: 'number' },
        totalResults: { type: 'number' },
      },
    },
  })
  async searchAll(@Query('query') query: string): Promise<UnifiedSearchResult> {
    return this.searchService.searchAll(query);
  }

  @Get('doctors')
  @ApiOperation({
    summary: 'Поиск только по врачам',
    description: 'Поиск врачей по имени, специализации и описанию',
  })
  @ApiQuery({
    name: 'query',
    description: 'Поисковый запрос',
    example: 'хирург',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Список найденных врачей',
    type: [Doctor],
  })
  async searchDoctors(@Query('query') query: string): Promise<Doctor[]> {
    return this.searchService.searchDoctorsOnly(query);
  }

  @Get('clinics')
  @ApiOperation({
    summary: 'Поиск только по клиникам',
    description: 'Поиск ветеринарных клиник по названию, адресу и описанию',
  })
  @ApiQuery({
    name: 'query',
    description: 'Поисковый запрос',
    example: 'ветеринарная клиника',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Список найденных клиник',
    type: [VetClinic],
  })
  async searchClinics(@Query('query') query: string): Promise<VetClinic[]> {
    return this.searchService.searchClinicsOnly(query);
  }
}
