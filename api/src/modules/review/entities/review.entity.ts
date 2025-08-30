import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { User } from '../../user/entities/user.entity';

export enum ReviewStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
}

@Entity()
export class Review {
  @ApiProperty({ description: 'Уникальный идентификатор отзыва', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

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
    description: 'Врач, к которому относится отзыв',
    type: () => Doctor,
  })
  @ManyToOne(() => Doctor, (doctor) => doctor.reviews, {
    onDelete: 'CASCADE', // Удаление при удалении доктора
  })
  @JoinColumn()
  doctor: Doctor;

  @ApiProperty({
    description: 'Пользователь, оставивший отзыв',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE', // Удаление при удалении пользователя
  })
  @JoinColumn()
  user: User;
}
