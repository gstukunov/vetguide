import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Appointment } from './entities/appointment.entity';

@ApiTags('Записи на прием')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({
    summary: 'Создать запись на прием',
    description: 'Доступно только для авторизованных пользователей',
  })
  @ApiResponse({
    status: 201,
    description: 'Запись успешно создана',
    type: Appointment,
  })
  @ApiResponse({
    status: 400,
    description: 'Временной слот недоступен или уже занят',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 404,
    description: 'Расписание не найдено',
  })
  create(@Request() req, @Body() dto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(
      req.user.userId || req.user.sub,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Отменить запись на прием',
    description: 'Пользователь может отменить только свою запись',
  })
  @ApiParam({
    name: 'id',
    description: 'ID записи',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Запись успешно отменена',
    type: Appointment,
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен - можно отменить только свою запись',
  })
  @ApiResponse({
    status: 404,
    description: 'Запись не найдена',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  cancel(@Request() req, @Param('id') id: string) {
    return this.appointmentService.cancelAppointment(
      id,
      req.user.userId || req.user.sub,
    );
  }

  @Get('my')
  @ApiOperation({
    summary: 'Получить список моих записей',
    description: 'Получить все записи текущего пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Список записей пользователя',
    type: [Appointment],
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  getMyAppointments(@Request() req) {
    return this.appointmentService.getUserAppointments(
      req.user.userId || req.user.sub,
    );
  }
}
