import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoctorScheduleSchema1761413837727
  implements MigrationInterface
{
  name = 'UpdateDoctorScheduleSchema1761413837727';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, check if the dayOfWeek column exists and drop it if it does
    const hasDayOfWeekColumn = await queryRunner.hasColumn(
      'doctor_schedule',
      'dayOfWeek',
    );

    if (hasDayOfWeekColumn) {
      // Drop the existing foreign key constraint
      await queryRunner.query(
        `ALTER TABLE "doctor_schedule" DROP CONSTRAINT "FK_3dbc83e2a26386a2e5065a75df8"`,
      );

      // Drop the existing dayOfWeek column
      await queryRunner.query(
        `ALTER TABLE "doctor_schedule" DROP COLUMN "dayOfWeek"`,
      );

      // Re-add the foreign key constraint
      await queryRunner.query(
        `ALTER TABLE "doctor_schedule" ADD CONSTRAINT "FK_3dbc83e2a26386a2e5065a75df8" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
    }

    // Add the new date column (only if it doesn't exist)
    const hasDateColumn = await queryRunner.hasColumn(
      'doctor_schedule',
      'date',
    );
    if (!hasDateColumn) {
      await queryRunner.query(
        `ALTER TABLE "doctor_schedule" ADD "date" date NOT NULL DEFAULT CURRENT_DATE`,
      );
    }

    // Add the new timeSlot column (only if it doesn't exist)
    const hasTimeSlotColumn = await queryRunner.hasColumn(
      'doctor_schedule',
      'timeSlot',
    );
    if (!hasTimeSlotColumn) {
      await queryRunner.query(
        `ALTER TABLE "doctor_schedule" ADD "timeSlot" character varying(5) NOT NULL DEFAULT '09:00'`,
      );
    }

    // Add unique index for doctor_id, date, and timeSlot (only if it doesn't exist)
    try {
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_doctor_schedule_unique_slot" ON "doctor_schedule" ("doctor_id", "date", "timeSlot")`,
      );
    } catch (error) {
      // Index might already exist, ignore the error
      console.log('Index might already exist, continuing...');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique index
    try {
      await queryRunner.query(`DROP INDEX "IDX_doctor_schedule_unique_slot"`);
    } catch (error) {
      // Index might not exist, ignore the error
      console.log('Index might not exist, continuing...');
    }

    // Drop the new columns
    const hasTimeSlotColumn = await queryRunner.hasColumn(
      'doctor_schedule',
      'timeSlot',
    );
    if (hasTimeSlotColumn) {
      await queryRunner.query(
        `ALTER TABLE "doctor_schedule" DROP COLUMN "timeSlot"`,
      );
    }

    const hasDateColumn = await queryRunner.hasColumn(
      'doctor_schedule',
      'date',
    );
    if (hasDateColumn) {
      await queryRunner.query(
        `ALTER TABLE "doctor_schedule" DROP COLUMN "date"`,
      );
    }

    // Add back the dayOfWeek column
    const hasDayOfWeekColumn = await queryRunner.hasColumn(
      'doctor_schedule',
      'dayOfWeek',
    );
    if (!hasDayOfWeekColumn) {
      await queryRunner.query(
        `ALTER TABLE "doctor_schedule" ADD "dayOfWeek" character varying NOT NULL`,
      );
    }
  }
}
