import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Get,
  UseGuards,
} from '@nestjs/common';
import { DoctorScheduleService } from './doctor-schedule.service';
import {
  CreateDoctorScheduleDto,
  UpdateDoctorScheduleDto,
} from './dto/doctor-schedule.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
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
    summary: 'Создать запись в расписании врача',
    description:
      'Доступно только для пользователей с ролью VET_CLINIC своей клиники',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID врача',
    type: Number,
  })
  @ApiBody({
    type: CreateDoctorScheduleDto,
    description: 'Данные для создания расписания',
  })
  @ApiResponse({
    status: 201,
    description: 'Запись в расписании успешно создана',
    type: DoctorSchedule,
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

  @Put(':id')
  @ApiOperation({
    summary: 'Обновить статус доступности врача',
    description:
      'Доступно только для пользователей с ролью VET_CLINIC своей клиники',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID врача',
    type: Number,
  })
  @ApiParam({
    name: 'id',
    description: 'ID записи в расписании',
    type: Number,
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
    description: 'Получение всего расписания конкретного врача',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID врача',
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
  findAll(@Param('doctorId') doctorId: string) {
    return this.scheduleService.getDoctorSchedules(doctorId);
  }
}
