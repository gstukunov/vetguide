import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/types/role.enum';
import { SafeUserDto } from '../user/dto/safe-user.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Админ')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Post('update-role')
  @Roles(UserRole.SUPER_ADMIN) // Только суперадмин может менять роли
  @ApiOperation({ summary: 'Обновление роли' })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Роль успешно обновлена',
    type: SafeUserDto,
  })
  @ApiResponse({ status: 403, description: 'Запрещено' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async updateUserRole(@Body() dto: UpdateUserRoleDto): Promise<SafeUserDto> {
    return this.userService.updateUserRole(dto.userId, dto.newRole);
  }
}
