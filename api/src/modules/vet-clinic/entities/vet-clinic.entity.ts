import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity()
export class VetClinic extends BaseEntity {
  // id наследуется от BaseEntity

  @ApiProperty({
    description: 'Адрес клиники',
    example: 'ул. Тверская, д. 1, Москва',
  })
  @Column()
  address: string;

  @ApiProperty({ description: 'ИНН клиники', example: '7701234567' })
  @Column({ unique: true })
  inn: string;

  @ApiProperty({
    description: 'Название клиники',
    example: 'Ветеринарная клиника "Добрый доктор"',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Описание клиники',
    example: 'Современная ветеринарная клиника с полным спектром услуг',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Список врачей в клинике',
    type: () => [Doctor],
    required: false,
  })
  @OneToMany(() => Doctor, (doctor) => doctor.clinic)
  doctors: Doctor[];

  @ApiProperty({
    description: 'Список пользователей клиники',
    type: () => [User],
    required: false,
  })
  @OneToMany(() => User, (user) => user.clinic)
  users: User[];
}
