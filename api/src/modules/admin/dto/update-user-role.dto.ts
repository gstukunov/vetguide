import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length, Matches } from 'class-validator';
import { UserRole } from '../../user/types/role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'ID пользователя, для которого меняется роль',
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @IsString()
  @Length(21, 21)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'ID должен содержать только буквы, цифры, дефисы и подчеркивания',
  })
  userId: string;

  @ApiProperty({
    description: 'Новая роль пользователя',
    enum: UserRole,
    example: UserRole.VET_CLINIC,
  })
  @IsEnum(UserRole)
  newRole: UserRole;
}
