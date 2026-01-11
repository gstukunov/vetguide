import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity()
@Index(['doctorId', 'date', 'timeSlot'], { unique: true })
export class Appointment extends BaseEntity {
  @ApiProperty({
    description: 'ID пользователя, создавшего запись',
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @Column({ nullable: false })
  user_id: string;

  @ApiProperty({
    type: () => User,
    description: 'Пользователь, создавший запись',
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'ID врача',
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @Column({ nullable: false })
  doctorId: string;

  @ApiProperty({
    type: () => Doctor,
    description: 'Врач, на которого записан пользователь',
  })
  @ManyToOne(() => Doctor, { nullable: false })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ApiProperty({
    description: 'Дата записи',
    example: '2024-01-15',
  })
  @Column({ type: 'date', nullable: false })
  date: string;

  @ApiProperty({
    description: 'Временной слот (формат HH:mm)',
    example: '09:00',
  })
  @Column({ type: 'varchar', length: 5, nullable: false })
  timeSlot: string;

  @ApiProperty({
    description: 'Статус записи',
    example: 'CONFIRMED',
    enum: ['CONFIRMED', 'CANCELLED'],
    default: 'CONFIRMED',
  })
  @Column({
    type: 'enum',
    enum: ['CONFIRMED', 'CANCELLED'],
    default: 'CONFIRMED',
  })
  status: 'CONFIRMED' | 'CANCELLED';
}
