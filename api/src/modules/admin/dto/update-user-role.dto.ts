import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';
import { UserRole } from '../../user/types/role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'ID пользователя, для которого меняется роль',
    example: 1,
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'Новая роль пользователя',
    enum: UserRole,
    example: UserRole.VET_CLINIC,
  })
  @IsEnum(UserRole)
  newRole: UserRole;
}
