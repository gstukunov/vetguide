import {
  MigrationInterface,
  QueryRunner,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class RemoveDoctorScheduleTable1738154756000
  implements MigrationInterface
{
  name = 'RemoveDoctorScheduleTable1738154756000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем существование таблицы doctor_schedule
    const doctorScheduleTable = await queryRunner.getTable('doctor_schedule');

    if (!doctorScheduleTable) {
      // Таблица уже удалена или не существует, ничего не делаем
      return;
    }

    // Удаляем все внешние ключи, ссылающиеся на doctor_schedule
    const foreignKeys = doctorScheduleTable.foreignKeys || [];
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('doctor_schedule', fk);
    }

    // Удаляем все индексы
    const indices = doctorScheduleTable.indices || [];
    for (const index of indices) {
      // Пропускаем первичный ключ (он удалится вместе с таблицей)
      if (index.name !== 'PK_doctor_schedule') {
        await queryRunner.dropIndex('doctor_schedule', index);
      }
    }

    // Удаляем таблицу doctor_schedule
    await queryRunner.dropTable('doctor_schedule');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Проверяем, существует ли таблица
    const doctorScheduleTable = await queryRunner.getTable('doctor_schedule');

    if (doctorScheduleTable) {
      // Таблица уже существует, ничего не делаем
      return;
    }

    // Восстанавливаем таблицу doctor_schedule
    await queryRunner.query(`
      CREATE TABLE "doctor_schedule" (
        "id" varchar(21) NOT NULL,
        "date" date NOT NULL,
        "timeSlot" varchar(5) NOT NULL,
        "isAvailable" boolean NOT NULL DEFAULT true,
        "doctor_id" varchar(21),
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_doctor_schedule" PRIMARY KEY ("id")
      )
    `);

    // Восстанавливаем внешний ключ для doctor_schedule.doctor_id -> doctor.id
    await queryRunner.createForeignKey(
      'doctor_schedule',
      new TableForeignKey({
        columnNames: ['doctor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'doctor',
        onDelete: 'CASCADE',
      }),
    );

    // Восстанавливаем уникальный индекс
    await queryRunner.createIndex(
      'doctor_schedule',
      new TableIndex({
        name: 'IDX_doctor_schedule_unique',
        columnNames: ['doctor_id', 'date', 'timeSlot'],
        isUnique: true,
      }),
    );
  }
}
