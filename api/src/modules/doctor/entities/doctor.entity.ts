import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { VetClinic } from '../../vet-clinic/entities/vet-clinic.entity';
import { Review } from '../../review/entities/review.entity';
import { DoctorSchedule } from '../../doctor-schedule/entities/doctor-schedule.entity';

@Entity()
export class Doctor {
  @ApiProperty({ description: 'Уникальный идентификатор врача', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Полное имя врача',
    example: 'Иванов Иван Иванович',
  })
  @Column()
  fullName: string;

  @ApiProperty({
    description: 'Описание врача',
    example: 'Опытный ветеринар с 10-летним стажем',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Список специалитетов врача',
    example: ['Терапевт', 'Хирург', 'Дерматолог'],
    type: [String],
    required: false,
  })
  @Column('simple-array', { nullable: true })
  specialization: string[];

  @ApiProperty({
    description: 'Ветклиника, в которой работает врач',
    type: () => VetClinic,
  })
  @ManyToOne(() => VetClinic, (clinic) => clinic.doctors)
  @JoinColumn()
  clinic: VetClinic;

  @ApiProperty({
    description: 'Список отзывов о враче',
    type: () => [Review],
    required: false,
  })
  @OneToMany(() => Review, (review) => review.doctor)
  reviews: Review[];

  @ApiProperty({
    description: 'Расписание работы врача',
    type: () => [DoctorSchedule],
    required: false,
  })
  @OneToMany(() => DoctorSchedule, (schedule) => schedule.doctor, {
    cascade: true,
  })
  schedules: DoctorSchedule[];

  @ApiProperty({
    description: 'Средний рейтинг врача (вычисляемое поле)',
    example: 4.5,
    required: false,
  })
  // Расчетный рейтинг (не сохраняется в БД)
  averageRating?: number;
}
