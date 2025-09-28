import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { User as UserType } from '../types/user.type';
import { UserRole } from '../types/role.enum';
import { Review } from '../../review/entities/review.entity';
import { VetClinic } from '../../vet-clinic/entities/vet-clinic.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity()
export class User extends BaseEntity implements UserType {
  // id наследуется от BaseEntity

  @ApiProperty({
    description: 'Номер телефона пользователя',
    example: '+79001234567',
  })
  @Column({ unique: true })
  phone: string;

  @ApiProperty({
    description: 'Хешированный пароль пользователя',
    example: 'hashed_password_string',
  })
  @Column()
  password: string;

  @ApiProperty({
    description: 'Полное имя пользователя',
    example: 'Иванов Иван Иванович',
  })
  @Column()
  fullName: string;

  @ApiProperty({
    description: 'Статус верификации пользователя',
    example: false,
  })
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty({
    description: 'Роль пользователя в системе',
    enum: UserRole,
    example: UserRole.USER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Список отзывов пользователя',
    type: () => [Review],
    required: false,
  })
  @OneToMany(() => Review, (review) => review.user, {
    cascade: true,
    nullable: true,
  })
  reviews: Review[];

  @ApiProperty({
    description: 'ID ветклиники',
    example: 'V1StGXR8_Z5jdHi6B-myT',
    required: false,
  })
  @Column({ nullable: true })
  clinic_id: string;

  @ApiProperty({
    type: () => VetClinic,
    description: 'Связанная ветеринарная клиника',
    required: false,
  })
  @ManyToOne(() => VetClinic, (clinic) => clinic.users)
  @JoinColumn({ name: 'clinic_id' })
  clinic: VetClinic;
}
