import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './modules/user/entities/user.entity';
import { VerificationCode } from './modules/verification/entity/verification.entity';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { VerificationModule } from './modules/verification/verification.module';
import { SmsModule } from './modules/sms/sms.module';
import { AdminModule } from './modules/admin/admin.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ReviewModule } from './modules/review/review.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { VetClinicModule } from './modules/vet-clinic/vet-clinic.module';
import { SearchModule } from './modules/search/search.module';
import { S3Module } from './modules/s3/s3.module';
import { Review } from './modules/review/entities/review.entity';
import { VetClinic } from './modules/vet-clinic/entities/vet-clinic.entity';
import { Doctor } from './modules/doctor/entities/doctor.entity';
import { DoctorScheduleModule } from './modules/doctor-schedule/doctor-schedule.module';
import { DoctorSchedule } from './modules/doctor-schedule/entities/doctor-schedule.entity';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 600,
        limit: 3,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: config.get('DB_PORT'),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_DATABASE'),
          entities: [
            User,
            VerificationCode,
            VetClinic,
            DoctorSchedule,
            Doctor,
            Review,
          ],
          // В продакшене используем миграции, в разработке - synchronize
          synchronize: !isProduction,
          migrationsRun: isProduction, // Автоматически запускать миграции в продакшене
          migrations: isProduction
            ? ['dist/migrations/*.js']
            : ['src/migrations/*.ts'],
          migrationsTableName: 'migrations',
          logging: !isProduction,
        };
      },
    }),
    AdminModule,
    UserModule,
    AuthModule,
    VerificationModule,
    SmsModule,
    ReviewModule,
    VetClinicModule,
    DoctorModule,
    DoctorScheduleModule,
    SearchModule,
    S3Module,
  ],
  controllers: [],
})
export class AppModule {}
