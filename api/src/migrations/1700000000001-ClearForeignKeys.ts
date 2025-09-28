import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClearForeignKeys1700000000001 implements MigrationInterface {
  name = 'ClearForeignKeys1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🧹 Очищаем foreign key связи для конвертации в NanoID...');

    // Очищаем все foreign key колонки
    await queryRunner.query('UPDATE "doctor" SET "clinicId" = NULL');
    await queryRunner.query('UPDATE "user" SET "clinic_id" = NULL');
    await queryRunner.query(
      'UPDATE "review" SET "doctorId" = NULL, "userId" = NULL',
    );
    await queryRunner.query('UPDATE "doctor_schedule" SET "doctor_id" = NULL');

    console.log('✅ Foreign key связи очищены');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('⚠️ Откат очистки foreign key связей не поддерживается!');
  }
}
