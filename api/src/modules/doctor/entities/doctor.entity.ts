import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { VetClinic } from '../../vet-clinic/entities/vet-clinic.entity';
import { Review } from '../../review/entities/review.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity()
export class Doctor extends BaseEntity {
  // id наследуется от BaseEntity

  @ApiProperty({
    description: 'Ключ фото врача в S3',
    example: 'avatars/doctors/V1StGXR8_Z5jdHi6B-myT/uuid.jpeg',
  })
  @Column({ nullable: true })
  photoKey: string;

  // Вычисляемое поле, не сохраняется в БД
  @ApiProperty({
    description: 'URL фото врача',
    example: 'https://example.com/photo.jpg',
    nullable: true,
    type: String,
  })
  photoUrl?: string | null;

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
    description: 'ID ветклиники',
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @Column({ nullable: true })
  clinicId: string;

  @ApiProperty({
    description: 'Ветклиника, в которой работает врач',
    type: () => VetClinic,
  })
  @ManyToOne(() => VetClinic, (clinic) => clinic.doctors)
  @JoinColumn({ name: 'clinicId' })
  clinic: VetClinic;

  @ApiProperty({
    description: 'Список отзывов о враче',
    type: () => [Review],
    required: false,
  })
  @OneToMany(() => Review, (review) => review.doctor)
  reviews: Review[];

  @ApiProperty({
    description: 'Средний рейтинг врача (вычисляемое поле)',
    example: 4.5,
    required: false,
  })
  // Расчетный рейтинг (не сохраняется в БД)
  averageRating?: number;
}
