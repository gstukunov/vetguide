import {
  MigrationInterface,
  QueryRunner,
  TableForeignKey,
  TableColumn,
  TableIndex,
  Table,
} from 'typeorm';

export class UpdateAppointmentSchema1735690000000
  implements MigrationInterface
{
  name = 'UpdateAppointmentSchema1735690000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Получаем таблицу appointment
    const appointmentTable = await queryRunner.getTable('appointment');

    // Если таблица не существует, создаем её с новой схемой
    if (!appointmentTable) {
      // Создаем enum для статуса записи
      await queryRunner.query(`
        CREATE TYPE "appointment_status_enum" AS ENUM ('CONFIRMED', 'CANCELLED')
      `);

      await queryRunner.createTable(
        new Table({
          name: 'appointment',
          columns: [
            {
              name: 'id',
              type: 'varchar',
              length: '21',
              isPrimary: true,
            },
            {
              name: 'user_id',
              type: 'varchar',
              length: '21',
              isNullable: false,
            },
            {
              name: 'doctorId',
              type: 'varchar',
              length: '21',
              isNullable: false,
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
              name: 'status',
              type: 'enum',
              enum: ['CONFIRMED', 'CANCELLED'],
              default: "'CONFIRMED'",
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
            },
          ],
        }),
        true,
      );

      // Создаем внешний ключ для user_id
      await queryRunner.createForeignKey(
        'appointment',
        new TableForeignKey({
          columnNames: ['user_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'user',
          onDelete: 'CASCADE',
        }),
      );

      // Создаем внешний ключ для doctorId
      await queryRunner.createForeignKey(
        'appointment',
        new TableForeignKey({
          columnNames: ['doctorId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'doctor',
          onDelete: 'CASCADE',
        }),
      );

      // Создаем уникальный индекс для doctorId, date, timeSlot
      await queryRunner.createIndex(
        'appointment',
        new TableIndex({
          name: 'IDX_appointment_doctor_date_timeslot',
          columnNames: ['doctorId', 'date', 'timeSlot'],
          isUnique: true,
        }),
      );

      return; // Таблица создана с новой схемой, выходим
    }

    // Таблица существует - обновляем схему со старой на новую
    const foreignKeys = appointmentTable.foreignKeys || [];
    for (const fk of foreignKeys) {
      if (fk.columnNames.includes('doctorSchedule_id')) {
        await queryRunner.dropForeignKey('appointment', fk);
      }
    }

    // Удаляем старый индекс
    const oldIndex = appointmentTable.indices.find(
      (idx) => idx.name === 'IDX_appointment_doctorSchedule_id_user_id',
    );
    if (oldIndex) {
      await queryRunner.dropIndex('appointment', oldIndex);
    }

    // Удаляем старую колонку doctorSchedule_id
    if (
      appointmentTable.columns.find((col) => col.name === 'doctorSchedule_id')
    ) {
      await queryRunner.dropColumn('appointment', 'doctorSchedule_id');
    }

    // Добавляем новые колонки (если их еще нет)
    if (!appointmentTable.columns.find((col) => col.name === 'doctorId')) {
      await queryRunner.addColumn(
        'appointment',
        new TableColumn({
          name: 'doctorId',
          type: 'varchar',
          length: '21',
          isNullable: false,
        }),
      );
    }

    if (!appointmentTable.columns.find((col) => col.name === 'date')) {
      await queryRunner.addColumn(
        'appointment',
        new TableColumn({
          name: 'date',
          type: 'date',
          isNullable: false,
        }),
      );
    }

    if (!appointmentTable.columns.find((col) => col.name === 'timeSlot')) {
      await queryRunner.addColumn(
        'appointment',
        new TableColumn({
          name: 'timeSlot',
          type: 'varchar',
          length: '5',
          isNullable: false,
        }),
      );
    }

    // Создаем внешний ключ для doctorId (если его еще нет)
    const hasDoctorIdFK = appointmentTable.foreignKeys.some((fk) =>
      fk.columnNames.includes('doctorId'),
    );
    if (!hasDoctorIdFK) {
      await queryRunner.createForeignKey(
        'appointment',
        new TableForeignKey({
          columnNames: ['doctorId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'doctor',
          onDelete: 'CASCADE',
        }),
      );
    }

    // Создаем новый уникальный индекс для doctorId, date, timeSlot (если его еще нет)
    const hasNewIndex = appointmentTable.indices.some(
      (idx) => idx.name === 'IDX_appointment_doctor_date_timeslot',
    );
    if (!hasNewIndex) {
      await queryRunner.createIndex(
        'appointment',
        new TableIndex({
          name: 'IDX_appointment_doctor_date_timeslot',
          columnNames: ['doctorId', 'date', 'timeSlot'],
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Получаем таблицу appointment
    const appointmentTable = await queryRunner.getTable('appointment');

    // Удаляем новый индекс
    if (appointmentTable) {
      const newIndex = appointmentTable.indices.find(
        (idx) => idx.name === 'IDX_appointment_doctor_date_timeslot',
      );
      if (newIndex) {
        await queryRunner.dropIndex('appointment', newIndex);
      }
    }

    // Удаляем внешний ключ для doctorId
    const appointmentForeignKeys = appointmentTable?.foreignKeys || [];
    for (const fk of appointmentForeignKeys) {
      if (fk.columnNames.includes('doctorId')) {
        await queryRunner.dropForeignKey('appointment', fk);
      }
    }

    // Удаляем новые колонки
    await queryRunner.dropColumn('appointment', 'timeSlot');
    await queryRunner.dropColumn('appointment', 'date');
    await queryRunner.dropColumn('appointment', 'doctorId');

    // Восстанавливаем старую колонку doctorSchedule_id
    await queryRunner.addColumn(
      'appointment',
      new TableColumn({
        name: 'doctorSchedule_id',
        type: 'varchar',
        length: '21',
        isNullable: false,
      }),
    );

    // Восстанавливаем внешний ключ
    await queryRunner.createForeignKey(
      'appointment',
      new TableForeignKey({
        columnNames: ['doctorSchedule_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'doctor_schedule',
        onDelete: 'CASCADE',
      }),
    );

    // Восстанавливаем старый индекс
    await queryRunner.createIndex(
      'appointment',
      new TableIndex({
        name: 'IDX_appointment_doctorSchedule_id_user_id',
        columnNames: ['doctorSchedule_id', 'user_id'],
        isUnique: true,
      }),
    );
  }
}
