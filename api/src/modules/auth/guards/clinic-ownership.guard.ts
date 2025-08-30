import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DoctorService } from '../../doctor/doctor.service';
import { UserRole } from '../../user/types/role.enum';

@Injectable()
export class ClinicOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private doctorService: DoctorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Добавляем async
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const doctorId: number = +request.params.doctorId; // Преобразуем в число

    // Проверка роли
    if (user.role !== UserRole.VET_CLINIC) return false;

    // Проверка наличия клиники у пользователя
    if (!user.clinic?.id) return false;

    return this.doctorService.isDoctorBelongsToClinic(doctorId, user.clinic.id); // Возвращаем Promise напрямую
  }
}
