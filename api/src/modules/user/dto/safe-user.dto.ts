import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types/role.enum';
import { Review } from '../../review/entities/review.entity';
import { VetClinic } from '../../vet-clinic/entities/vet-clinic.entity';

export class SafeUserDto {
  @ApiProperty({ example: 'V1StGXR8_Z5jdHi6B-myT' })
  id: string;

  @ApiProperty({ example: '+79123456789' })
  phone: string;

  @ApiProperty({ example: 'Иван Иванов' })
  fullName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ default: false })
  isVerified: boolean;

  @ApiProperty({ type: () => [Review], required: false })
  reviews: Review[];

  @ApiProperty({ type: () => VetClinic, required: false })
  clinic: VetClinic;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
