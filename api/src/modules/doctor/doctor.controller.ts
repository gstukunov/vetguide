import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/types/role.enum';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { TopDoctorsQueryDto } from './dto/top-doctors.dto';
import { DoctorParamsDto } from './dto/doctor-params.dto';
import { Doctor } from './entities/doctor.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Врачи')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateDoctorDto })
  @ApiResponse({
    status: 200,
    description: 'Успешно создан',
  })
  async create(@Body() createDto: CreateDoctorDto): Promise<Doctor> {
    return this.doctorService.create(createDto);
  }

  @Get('top')
  @ApiOperation({
    summary: 'Получить топ докторов',
    description:
      'Получение списка лучших докторов, отсортированных по рейтингу от лучшего к худшему',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Количество докторов для возврата (1-100)',
    example: 10,
    required: false,
  })
  @ApiQuery({
    name: 'minRating',
    description: 'Минимальный рейтинг для фильтрации (1.0-5.0)',
    example: 4.0,
    required: false,
  })
  @ApiQuery({
    name: 'specialization',
    description: 'Фильтр по специализации',
    example: 'хирург',
    required: false,
  })
  @ApiQuery({
    name: 'clinicId',
    description: 'ID клиники для фильтрации',
    example: 1,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Список топ докторов с рейтингами',
    type: [Doctor],
  })
  async getTopDoctors(@Query() query: TopDoctorsQueryDto): Promise<Doctor[]> {
    return this.doctorService.getTopDoctors(query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Поиск врачей',
    description: 'Поиск врачей по имени, специализации и описанию',
  })
  @ApiQuery({
    name: 'query',
    description: 'Поисковый запрос',
    example: 'кардиолог',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Список найденных врачей',
    type: [Doctor],
  })
  async searchDoctors(@Query('query') query: string): Promise<Doctor[]> {
    return this.doctorService.searchDoctors(query);
  }

  @Get('search/specialization')
  @ApiOperation({
    summary: 'Поиск врачей по специализации',
    description: 'Поиск врачей по конкретной специализации',
  })
  @ApiQuery({
    name: 'specialization',
    description: 'Специализация',
    example: 'хирург',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Список врачей с указанной специализацией',
    type: [Doctor],
  })
  async searchBySpecialization(
    @Query('specialization') specialization: string,
  ): Promise<Doctor[]> {
    return this.doctorService.searchDoctorsBySpecialization(specialization);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Обновить информацию о враче',
    description:
      'Обновление информации о враче (только для супер-администраторов)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID врача',
    type: String,
  })
  @ApiBody({ type: UpdateDoctorDto })
  @ApiResponse({
    status: 200,
    description: 'Информация о враче успешно обновлена',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный ID врача',
  })
  @ApiResponse({
    status: 404,
    description: 'Врач не найден',
  })
  async update(
    @Param() params: DoctorParamsDto,
    @Body() updateDto: UpdateDoctorDto,
  ): Promise<Doctor> {
    return this.doctorService.update(params.id, updateDto);
  }

  @Post(':id/photo')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Загрузить/обновить фото врача' })
  @ApiParam({ name: 'id', description: 'ID врача', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
      required: ['image'],
    },
  })
  @ApiResponse({ status: 200, description: 'Фото загружено и сохранено' })
  @ApiResponse({ status: 400, description: 'Файл изображения не предоставлен' })
  @ApiResponse({ status: 404, description: 'Врач не найден' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async uploadPhoto(
    @Param() params: DoctorParamsDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл изображения не предоставлен');
    }
    return this.doctorService.uploadPhoto(params.id, file);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить информацию о враче',
    description: 'Получение полной информации о враче',
  })
  @ApiParam({
    name: 'id',
    description: 'ID врача',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о враче',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный ID врача',
  })
  @ApiResponse({
    status: 404,
    description: 'Врач не найден',
  })
  async findOne(
    @Param() params: DoctorParamsDto,
  ): Promise<Doctor & { photoUrl: string | null }> {
    const doctor = await this.doctorService.findOne(params.id);
    const photoUrl = this.doctorService.getPhotoUrl(doctor.photoKey);
    return {
      ...doctor,
      photoUrl,
    };
  }

  @Get(':id/photo-url')
  @ApiOperation({
    summary: 'Получить URL фото врача',
    description: 'Получение подписанного URL для фото врача',
  })
  @ApiParam({
    name: 'id',
    description: 'ID врача',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'URL фото врача',
    schema: {
      type: 'object',
      properties: {
        photoUrl: { type: 'string', description: 'Постоянный URL фото' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Врач не найден или у него нет фото',
  })
  async getPhotoUrl(@Param() params: DoctorParamsDto) {
    const doctor = await this.doctorService.findOne(params.id);
    if (!doctor.photoKey) {
      throw new NotFoundException('У врача нет фото');
    }
    const photoUrl = this.doctorService.getPhotoUrl(doctor.photoKey);
    return {
      photoUrl,
    };
  }

  @Get(':id/schedule')
  @ApiOperation({
    summary: 'Получить врача с расписанием',
    description: 'Полная информация о враче вместе с его расписанием',
  })
  @ApiParam({
    name: 'id',
    description: 'ID врача',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о враче и его расписании',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный ID врача',
  })
  @ApiResponse({
    status: 404,
    description: 'Врач не найден',
  })
  async getDoctorSchedule(@Param() params: DoctorParamsDto) {
    const doctor = await this.doctorService.getDoctorWithSchedule(params.id);
    const photoUrl = this.doctorService.getPhotoUrl(doctor.photoKey);
    return {
      ...doctor,
      photoUrl,
    };
  }
}
