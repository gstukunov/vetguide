import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Get,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DoctorScheduleService } from './doctor-schedule.service';
import {
  CreateDoctorScheduleDto,
  UpdateDoctorScheduleDto,
  BulkCreateDoctorScheduleDto,
  GetDoctorScheduleDto,
} from './dto/doctor-schedule.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ClinicOwnershipGuard } from '../auth/guards/clinic-ownership.guard';
import { DoctorSchedule } from './entities/doctor-schedule.entity';

@ApiTags('Расписание врачей')
@ApiBearerAuth('access-token')
@Controller('doctors/:doctorId/schedules')
@UseGuards(ClinicOwnershipGuard)
export class DoctorScheduleController {
  constructor(private readonly scheduleService: DoctorScheduleService) {}

  @Post()
  @ApiOperation({
    summary: 'Создать временной слот в расписании врача',
    description:
      'Доступно только для пользователей с ролью VET_CLINIC своей клиники',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID врача',
    type: String,
  })
  @ApiBody({
    type: CreateDoctorScheduleDto,
    description: 'Данные для создания временного слота',
  })
  @ApiResponse({
    status: 201,
    description: 'Временной слот успешно создан',
    type: DoctorSchedule,
  })
  @ApiResponse({
    status: 400,
    description: 'Временной слот уже существует для этой даты и времени',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен',
  })
  @ApiResponse({
    status: 404,
    description: 'Врач не найден',
  })
  create(
    @Param('doctorId') doctorId: string,
    @Body() dto: CreateDoctorScheduleDto,
  ) {
    return this.scheduleService.createSchedule(doctorId, dto);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Массовое создание временных слотов',
    description: 'Создание расписания для нескольких дней и временных слотов',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID врача',
    type: String,
  })
  @ApiBody({
    type: BulkCreateDoctorScheduleDto,
    description: 'Данные для массового создания расписания',
  })
  @ApiResponse({
    status: 201,
    description: 'Временные слоты успешно созданы',
    type: [DoctorSchedule],
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен',
  })
  @ApiResponse({
    status: 404,
    description: 'Врач не найден',
  })
  bulkCreate(
    @Param('doctorId') doctorId: string,
    @Body() dto: BulkCreateDoctorScheduleDto,
  ) {
    return this.scheduleService.bulkCreateSchedule(doctorId, dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Обновить статус доступности временного слота',
    description:
      'Доступно только для пользователей с ролью VET_CLINIC своей клиники',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID врача',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID записи в расписании',
    type: String,
  })
  @ApiBody({
    type: UpdateDoctorScheduleDto,
    description: 'Новый статус доступности',
  })
  @ApiResponse({
    status: 200,
    description: 'Статус доступности обновлен',
    type: DoctorSchedule,
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен',
  })
  @ApiResponse({
    status: 404,
    description: 'Запись в расписании не найдена',
  })
  update(@Param('id') id: string, @Body() dto: UpdateDoctorScheduleDto) {
    return this.scheduleService.updateSchedule(id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить расписание врача',
    description:
      'Получение расписания конкретного врача с возможностью фильтрации',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID врача',
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Дата начала периода (YYYY-MM-DD)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Дата окончания периода (YYYY-MM-DD)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'weeks',
    description: 'Количество недель для получения',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Список записей в расписании',
    type: [DoctorSchedule],
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен',
  })
  @ApiResponse({
    status: 404,
    description: 'Врач не найден',
  })
  findAll(
    @Param('doctorId') doctorId: string,
    @Query() query: GetDoctorScheduleDto,
  ) {
    return this.scheduleService.getDoctorSchedules(doctorId, query);
  }

  @Get('ui')
  @ApiOperation({
    summary: 'Получить расписание для UI',
    description:
      'Получение расписания в формате, оптимизированном для UI компонента',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID врача',
    type: String,
  })
  @ApiQuery({
    name: 'weeks',
    description: 'Количество недель для получения (по умолчанию 4)',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Расписание в формате для UI',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен',
  })
  @ApiResponse({
    status: 404,
    description: 'Врач не найден',
  })
  getScheduleForUI(
    @Param('doctorId') doctorId: string,
    @Query('weeks') weeks?: number,
  ) {
    return this.scheduleService.getScheduleForUI(doctorId, weeks);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить временной слот',
    description:
      'Доступно только для пользователей с ролью VET_CLINIC своей клиники',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID врача',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID записи в расписании',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Временной слот успешно удален',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен',
  })
  @ApiResponse({
    status: 404,
    description: 'Запись в расписании не найдена',
  })
  delete(@Param('id') id: string) {
    return this.scheduleService.deleteSchedule(id);
  }
}
