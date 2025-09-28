import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum WeekDay {
  MONDAY = 'Понедельник',
  TUESDAY = 'Вторник',
  WEDNESDAY = 'Среда',
  THURSDAY = 'Четверг',
  FRIDAY = 'Пятница',
  SATURDAY = 'Суббота',
  SUNDAY = 'Воскресенье',
}

@Entity()
export class DoctorSchedule extends BaseEntity {
  // id наследуется от BaseEntity

  @ApiProperty({
    enum: WeekDay,
    description: 'День недели',
    example: WeekDay.MONDAY,
    enumName: 'WeekDay',
  })
  @Column({
    type: 'enum',
    enum: WeekDay,
    nullable: false,
  })
  dayOfWeek: WeekDay;

  @ApiProperty({
    description: 'Доступен ли врач в этот день',
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
