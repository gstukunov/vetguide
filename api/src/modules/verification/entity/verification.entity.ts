import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class VerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: string;

  @Column()
  code: string;

  @Column({ default: false })
  isVerified: boolean; // Добавляем флаг подтверждения

  @CreateDateColumn()
  createdAt: Date;
}
