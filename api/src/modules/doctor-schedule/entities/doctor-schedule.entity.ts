import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity()
@Index(['doctor_id', 'date', 'timeSlot'], { unique: true })
export class DoctorSchedule extends BaseEntity {
  // id наследуется от BaseEntity

  @ApiProperty({
    description: 'Дата расписания',
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
    description: 'Доступен ли временной слот для записи',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isAvailable: boolean;

  @ApiProperty({
    description: 'ID врача',
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @Column({ nullable: true })
  doctor_id: string;

  @ApiProperty({
    type: () => Doctor,
    description: 'Связанный врач',
  })
  @ManyToOne(() => Doctor, (doctor) => doctor.schedules)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}
