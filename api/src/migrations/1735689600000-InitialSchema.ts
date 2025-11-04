import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class InitialSchema1735689600000 implements MigrationInterface {
  name = 'InitialSchema1735689600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создание enum для UserRole
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('USER', 'VET_CLINIC', 'SUPER_ADMIN')
    `);

    // Создание enum для ReviewStatus
    await queryRunner.query(`
      CREATE TYPE "review_status_enum" AS ENUM ('PENDING', 'VERIFIED')
    `);

    // Создание таблицы vet_clinic
    await queryRunner.createTable(
      new Table({
        name: 'vet_clinic',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '21',
            isPrimary: true,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'inn',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создание таблицы user
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '21',
            isPrimary: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'fullName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'isVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'role',
            type: 'user_role_enum',
            default: "'USER'",
          },
          {
            name: 'clinic_id',
            type: 'varchar',
            length: '21',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создание внешнего ключа для user.clinic_id -> vet_clinic.id
    const userClinicForeignKey = new TableForeignKey({
      columnNames: ['clinic_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'vet_clinic',
      onDelete: 'SET NULL',
    });
    await queryRunner.createForeignKey('user', userClinicForeignKey);

    // Создание таблицы verification_code
    await queryRunner.createTable(
      new Table({
        name: 'verification_code',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '21',
            isPrimary: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'isVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создание таблицы doctor
    await queryRunner.createTable(
      new Table({
        name: 'doctor',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '21',
            isPrimary: true,
          },
          {
            name: 'photoKey',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'fullName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'specialization',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'clinicId',
            type: 'varchar',
            length: '21',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создание внешнего ключа для doctor.clinicId -> vet_clinic.id
    const doctorClinicForeignKey = new TableForeignKey({
      columnNames: ['clinicId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'vet_clinic',
      onDelete: 'SET NULL',
    });
    await queryRunner.createForeignKey('doctor', doctorClinicForeignKey);

    // Создание таблицы review
    await queryRunner.createTable(
      new Table({
        name: 'review',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '21',
            isPrimary: true,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'rating',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'review_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'doctorId',
            type: 'varchar',
            length: '21',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '21',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создание внешних ключей для review
    const reviewDoctorForeignKey = new TableForeignKey({
      columnNames: ['doctorId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'doctor',
      onDelete: 'CASCADE',
    });
    await queryRunner.createForeignKey('review', reviewDoctorForeignKey);

    const reviewUserForeignKey = new TableForeignKey({
      columnNames: ['userId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user',
      onDelete: 'CASCADE',
    });
    await queryRunner.createForeignKey('review', reviewUserForeignKey);

    // Создание таблицы doctor_schedule
    await queryRunner.createTable(
      new Table({
        name: 'doctor_schedule',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '21',
            isPrimary: true,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'timeSlot',
            type: 'varchar',
            length: '5',
            isNullable: false,
          },
          {
            name: 'isAvailable',
            type: 'boolean',
            default: true,
          },
          {
            name: 'doctor_id',
            type: 'varchar',
            length: '21',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создание внешнего ключа для doctor_schedule.doctor_id -> doctor.id
    const doctorScheduleForeignKey = new TableForeignKey({
      columnNames: ['doctor_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'doctor',
      onDelete: 'CASCADE',
    });
    await queryRunner.createForeignKey(
      'doctor_schedule',
      doctorScheduleForeignKey,
    );

    // Создание уникального составного индекса для doctor_schedule
    await queryRunner.createIndex(
      'doctor_schedule',
      new TableIndex({
        name: 'IDX_doctor_schedule_unique',
        columnNames: ['doctor_id', 'date', 'timeSlot'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Получаем все внешние ключи и удаляем их
    const doctorScheduleTable = await queryRunner.getTable('doctor_schedule');
    const doctorScheduleForeignKeys = doctorScheduleTable?.foreignKeys || [];
    for (const fk of doctorScheduleForeignKeys) {
      await queryRunner.dropForeignKey('doctor_schedule', fk);
    }

    const reviewTable = await queryRunner.getTable('review');
    const reviewForeignKeys = reviewTable?.foreignKeys || [];
    for (const fk of reviewForeignKeys) {
      await queryRunner.dropForeignKey('review', fk);
    }

    const doctorTable = await queryRunner.getTable('doctor');
    const doctorForeignKeys = doctorTable?.foreignKeys || [];
    for (const fk of doctorForeignKeys) {
      await queryRunner.dropForeignKey('doctor', fk);
    }

    const userTable = await queryRunner.getTable('user');
    const userForeignKeys = userTable?.foreignKeys || [];
    for (const fk of userForeignKeys) {
      await queryRunner.dropForeignKey('user', fk);
    }

    // Удаление индексов
    const doctorScheduleIndex = await queryRunner.getTable('doctor_schedule');
    if (doctorScheduleIndex) {
      const index = doctorScheduleIndex.indices.find(
        (idx) => idx.name === 'IDX_doctor_schedule_unique',
      );
      if (index) {
        await queryRunner.dropIndex('doctor_schedule', index);
      }
    }

    // Удаление таблиц
    await queryRunner.dropTable('doctor_schedule');
    await queryRunner.dropTable('review');
    await queryRunner.dropTable('doctor');
    await queryRunner.dropTable('verification_code');
    await queryRunner.dropTable('user');
    await queryRunner.dropTable('vet_clinic');

    // Удаление enum типов
    await queryRunner.query(`DROP TYPE IF EXISTS "review_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
