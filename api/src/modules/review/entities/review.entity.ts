import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ReviewStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
}

@Entity()
export class Review extends BaseEntity {
  // id наследуется от BaseEntity

  @ApiProperty({ description: 'Заголовок отзыва', example: 'Отличный врач!' })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Текст отзыва',
    example: 'Очень внимательный и профессиональный врач. Рекомендую!',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Рейтинг отзыва (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @Column({ type: 'int' })
  rating: number; // 1-5

  @ApiProperty({
    description: 'Статус отзыва',
    enum: ReviewStatus,
    example: ReviewStatus.VERIFIED,
  })
  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @ApiProperty({
    description: 'ID врача',
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @Column({ nullable: true })
  doctorId: string;

  @ApiProperty({
    description: 'ID пользователя',
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @Column({ nullable: true })
  userId: string;

  @ApiProperty({
    description: 'Врач, к которому относится отзыв',
    type: () => Doctor,
  })
  @ManyToOne(() => Doctor, (doctor) => doctor.reviews, {
    onDelete: 'CASCADE', // Удаление при удалении доктора
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ApiProperty({
    description: 'Пользователь, оставивший отзыв',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE', // Удаление при удалении пользователя
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
