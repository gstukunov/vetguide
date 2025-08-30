import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User as UserType } from '../types/user.type';
import { UserRole } from '../types/role.enum';
import { Review } from '../../review/entities/review.entity';
import { VetClinic } from '../../vet-clinic/entities/vet-clinic.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User implements UserType {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

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
    type: () => VetClinic,
    description: 'Связанная ветеринарная клиника',
    required: false,
  })
  @ManyToOne(() => VetClinic, (clinic) => clinic.users)
  @JoinColumn({ name: 'clinic_id' })
  clinic: VetClinic;

  @ApiProperty({
    description: 'Дата создания пользователя',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления пользователя',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
