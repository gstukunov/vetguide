import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertToNanoidFixed1700000000002 implements MigrationInterface {
  name = 'ConvertToNanoidFixed1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Начинаем конвертацию в NanoID...');

    // 1. Удаляем все foreign key constraints
    await this.dropAllForeignKeys(queryRunner);

    // 2. Конвертируем таблицы в правильном порядке
    const tables = [
      'user',
      'vet_clinic',
      'doctor',
      'review',
      'doctor_schedule',
      'verification_code',
    ];

    for (const table of tables) {
      await this.convertTableToNanoid(queryRunner, table);
    }

    // 3. Пересоздаем foreign key constraints
    await this.recreateForeignKeys(queryRunner);

    console.log('✅ Конвертация в NanoID завершена!');
  }

  private async dropAllForeignKeys(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️ Удаляем все foreign key constraints...');

    const foreignKeys = [
      { table: 'review', constraint: 'FK_0fb82b25db634a2eabfbf4329ba' },
      { table: 'review', constraint: 'FK_1337f93918c70837d3cea105d39' },
      {
        table: 'doctor_schedule',
        constraint: 'FK_3dbc83e2a26386a2e5065a75df8',
      },
      { table: 'doctor', constraint: 'FK_b3b7adce2d51d8fc43d3c98b057' },
      { table: 'user', constraint: 'FK_89ef5c4a4d2f7959c9368610ed2' },
    ];

    for (const fk of foreignKeys) {
      try {
        await queryRunner.query(
          `ALTER TABLE "${fk.table}" DROP CONSTRAINT IF EXISTS "${fk.constraint}"`,
        );
      } catch (error) {
        console.log(
          `⚠️ Не удалось удалить constraint ${fk.constraint} из таблицы ${fk.table}`,
        );
      }
    }
  }

  private async convertTableToNanoid(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<void> {
    console.log(`🔄 Конвертируем таблицу ${tableName}...`);

    try {
      // Проверяем, существует ли таблица
      const tableExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        );
      `);

      if (!tableExists[0].exists) {
        console.log(`⚠️ Таблица ${tableName} не существует, пропускаем`);
        return;
      }

      // Создаем новую колонку
      await queryRunner.query(
        `ALTER TABLE "${tableName}" ADD COLUMN "new_id" varchar(21) NOT NULL DEFAULT ''`,
      );

      // Генерируем NanoID для всех записей
      await queryRunner.query(`
        UPDATE "${tableName}" 
        SET "new_id" = substr(md5(random()::text || clock_timestamp()::text), 1, 21)
      `);

      // Удаляем старый primary key
      await queryRunner.query(
        `ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "PK_${tableName}"`,
      );

      // Удаляем старую колонку id
      await queryRunner.query(`ALTER TABLE "${tableName}" DROP COLUMN "id"`);

      // Переименовываем новую колонку
      await queryRunner.query(
        `ALTER TABLE "${tableName}" RENAME COLUMN "new_id" TO "id"`,
      );

      // Создаем новый primary key
      await queryRunner.query(
        `ALTER TABLE "${tableName}" ADD CONSTRAINT "PK_${tableName}" PRIMARY KEY ("id")`,
      );

      console.log(`✅ Таблица ${tableName} конвертирована в NanoID`);
    } catch (error) {
      console.error(
        `❌ Ошибка при конвертации таблицы ${tableName}:`,
        error.message,
      );
      throw error;
    }
  }

  private async recreateForeignKeys(queryRunner: QueryRunner): Promise<void> {
    console.log('🔗 Пересоздаем foreign key constraints...');

    const foreignKeys = [
      { table: 'review', column: 'doctorId', target: 'doctor' },
      { table: 'review', column: 'userId', target: 'user' },
      { table: 'doctor_schedule', column: 'doctor_id', target: 'doctor' },
      { table: 'doctor', column: 'clinicId', target: 'vet_clinic' },
      { table: 'user', column: 'clinic_id', target: 'vet_clinic' },
    ];

    for (const fk of foreignKeys) {
      try {
        // Сначала обновляем foreign key колонки на строки
        await queryRunner.query(
          `ALTER TABLE "${fk.table}" ALTER COLUMN "${fk.column}" TYPE varchar(21)`,
        );

        // Теперь создаем foreign key constraint
        await queryRunner.query(`
          ALTER TABLE "${fk.table}" 
          ADD CONSTRAINT "FK_${fk.table}_${fk.target}" 
          FOREIGN KEY ("${fk.column}") 
          REFERENCES "${fk.target}"("id") 
          ON DELETE CASCADE
        `);
        console.log(
          `✅ Создан FK: ${fk.table}.${fk.column} -> ${fk.target}.id`,
        );
      } catch (error) {
        console.log(
          `⚠️ Не удалось создать FK для ${fk.table}.${fk.column}:`,
          error.message,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('⚠️ Откат миграции NanoID не поддерживается!');
    console.log(
      '⚠️ Для отката требуется восстановление из backup базы данных.',
    );
  }
}
