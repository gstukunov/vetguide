import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DoctorService } from '../../doctor/doctor.service';
import { UserService } from '../../user/user.service';
import { UserRole } from '../../user/types/role.enum';

@Injectable()
export class ClinicOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private doctorService: DoctorService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let user = request.user;
    const doctorId: string = request.params.doctorId;

    // Проверка наличия пользователя (должен быть установлен JwtAuthGuard)
    if (!user) {
      throw new UnauthorizedException('Пользователь не аутентифицирован');
    }

    // Если user содержит только userId, загружаем полную информацию из БД
    if (user.userId && !user.clinic) {
      try {
        const fullUser = await this.userService.getMe(user.userId);

        // Обновляем user объект в request
        request.user = {
          ...user,
          role: fullUser.role,
          clinic: fullUser.clinic,
        };
        user = request.user;
      } catch (error) {
        throw new UnauthorizedException('Пользователь не найден');
      }
    }

    // Проверка роли
    if (user.role !== UserRole.VET_CLINIC) {
      return false;
    }

    // Проверка наличия клиники у пользователя
    if (!user.clinic?.id) {
      return false;
    }

    return this.doctorService.isDoctorBelongsToClinic(doctorId, user.clinic.id);
  }
}
