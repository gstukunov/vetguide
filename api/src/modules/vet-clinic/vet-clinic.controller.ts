import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/types/role.enum';
import { VetClinicService } from './vet-clinic.service';
import { CreateVetClinicDto } from './dto/create-vet-clinic.dto';
import { VetClinicParamsDto } from './dto/vet-clinic-params.dto';
import { VetClinic } from './entities/vet-clinic.entity';

@ApiTags('Ветклиники')
@Controller('vet-clinics')
export class VetClinicController {
  constructor(private readonly vetClinicService: VetClinicService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Создать новую ветеринарную клинику',
    description:
      'Создание новой ветеринарной клиники (только для супер-администраторов)',
  })
  @ApiBody({ type: CreateVetClinicDto })
  @ApiResponse({
    status: 201,
    description: 'Клиника успешно создана',
    type: VetClinic,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 403,
    description: 'Недостаточно прав',
  })
  async create(@Body() createDto: CreateVetClinicDto): Promise<VetClinic> {
    return this.vetClinicService.create(createDto);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Поиск ветеринарных клиник',
    description: 'Поиск клиник по названию, адресу и описанию',
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
    return this.vetClinicService.searchClinics(query);
  }

  @Get('search/address')
  @ApiOperation({
    summary: 'Поиск клиник по адресу',
    description: 'Поиск клиник по конкретному адресу',
  })
  @ApiQuery({
    name: 'address',
    description: 'Адрес для поиска',
    example: 'Москва, ул. Тверская',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Список клиник по указанному адресу',
    type: [VetClinic],
  })
  async searchByAddress(
    @Query('address') address: string,
  ): Promise<VetClinic[]> {
    return this.vetClinicService.searchClinicsByAddress(address);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить информацию о клинике',
    description: 'Получение полной информации о ветеринарной клинике',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о клинике',
    type: VetClinic,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный ID клиники',
  })
  @ApiResponse({
    status: 404,
    description: 'Клиника не найдена',
  })
  async findOne(@Param() params: VetClinicParamsDto): Promise<VetClinic> {
    return this.vetClinicService.findOne(params.id);
  }
}
