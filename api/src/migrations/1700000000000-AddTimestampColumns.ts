import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampColumns1700000000000 implements MigrationInterface {
  name = 'AddTimestampColumns1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем createdAt и updatedAt колонки в таблицы, где их нет

    // 1. Добавляем в таблицу doctor
    await queryRunner.query(`
            ALTER TABLE "doctor" 
            ADD COLUMN "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "doctor" 
            ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);

    // 2. Добавляем в таблицу vet_clinic
    await queryRunner.query(`
            ALTER TABLE "vet_clinic" 
            ADD COLUMN "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "vet_clinic" 
            ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);

    // 3. Добавляем в таблицу review
    await queryRunner.query(`
            ALTER TABLE "review" 
            ADD COLUMN "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "review" 
            ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);

    // 4. Добавляем в таблицу doctor_schedule (если существует)
    try {
      await queryRunner.query(`
                ALTER TABLE "doctor_schedule" 
                ADD COLUMN "createdAt" TIMESTAMP NOT NULL DEFAULT now()
            `);
      await queryRunner.query(`
                ALTER TABLE "doctor_schedule" 
                ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            `);
    } catch (error) {
      console.log('Table doctor_schedule might not exist, skipping...');
    }

    // 5. Добавляем в таблицу verification_code (только updatedAt, createdAt уже есть)
    try {
      await queryRunner.query(`
                ALTER TABLE "verification_code" 
                ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            `);
    } catch (error) {
      console.log(
        'Table verification_code might not exist or updatedAt already exists, skipping...',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем добавленные колонки в обратном порядке

    // 1. Удаляем из verification_code (только updatedAt)
    try {
      await queryRunner.query(
        `ALTER TABLE "verification_code" DROP COLUMN "updatedAt"`,
      );
    } catch (error) {
      console.log(
        'Table verification_code might not exist or updatedAt does not exist, skipping...',
      );
    }

    // 2. Удаляем из doctor_schedule
    try {
      await queryRunner.query(
        `ALTER TABLE "doctor_schedule" DROP COLUMN "updatedAt"`,
      );
      await queryRunner.query(
        `ALTER TABLE "doctor_schedule" DROP COLUMN "createdAt"`,
      );
    } catch (error) {
      console.log('Table doctor_schedule might not exist, skipping...');
    }

    // 3. Удаляем из review
    await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "createdAt"`);

    // 4. Удаляем из vet_clinic
    await queryRunner.query(`ALTER TABLE "vet_clinic" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "vet_clinic" DROP COLUMN "createdAt"`);

    // 5. Удаляем из doctor
    await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "createdAt"`);
  }
}
