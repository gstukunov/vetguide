import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity()
export class VerificationCode extends BaseEntity {
  // id наследуется от BaseEntity

  @Column()
  phone: string;

  @Column()
  code: string;

  @Column({ default: false })
  isVerified: boolean; // Добавляем флаг подтверждения

  // createdAt и updatedAt наследуются от BaseEntity
}
