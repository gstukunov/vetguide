import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/user/entities/user.entity';
import { VerificationCode } from '../modules/verification/entity/verification.entity';
import { VetClinic } from '../modules/vet-clinic/entities/vet-clinic.entity';
import { DoctorSchedule } from '../modules/doctor-schedule/entities/doctor-schedule.entity';
import { Doctor } from '../modules/doctor/entities/doctor.entity';
import { Review } from '../modules/review/entities/review.entity';

// Загружаем переменные окружения из .env файла
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, VerificationCode, VetClinic, DoctorSchedule, Doctor, Review],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
});

export default AppDataSource;
