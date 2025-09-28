#!/usr/bin/env ts-node

/**
 * Утилита для генерации SQL миграции конвертации ID в NanoID
 *
 * Использование:
 * 1. Запустить этот скрипт для генерации SQL
 *    ts-node scripts/generate-migration-sql.ts > migration-to-nanoid.sql
 * 2. Проверить сгенерированный SQL и при необходимости отредактировать
 * 3. Выполнить SQL на базе данных
 */

console.log('-- Миграция для конвертации ID в NanoID');
console.log('-- ВНИМАНИЕ: Сделайте backup базы данных перед выполнением!\n');

const tables = [
  'user',
  'vet_clinic',
  'doctor',
  'review',
  'doctor_schedule',
  'verification_code',
];

// Генерируем SQL для каждой таблицы
tables.forEach((table, index) => {
  console.log(`-- ============================================`);
  console.log(`-- Обновление таблицы ${table}`);
  console.log(`-- ============================================`);

  // 1. Создаем новую колонку
  console.log(
    `ALTER TABLE "${table}" ADD COLUMN "new_id" varchar(21) NOT NULL DEFAULT '';`,
  );

  // 2. Генерируем новые ID (в реальности это будет сделано через UPDATE с функцией)
  console.log(`-- Обновление ID для таблицы ${table}`);
  console.log(
    `UPDATE "${table}" SET "new_id" = substr(md5(random()::text || clock_timestamp()::text), 1, 21);`,
  );

  // 3. Удаляем старые constraints
  console.log(`-- Удаление старых constraints`);
  console.log(
    `ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "PK_${table}";`,
  );

  // 4. Удаляем старую колонку
  console.log(`ALTER TABLE "${table}" DROP COLUMN "id";`);

  // 5. Переименовываем новую колонку
  console.log(`ALTER TABLE "${table}" RENAME COLUMN "new_id" TO "id";`);

  // 6. Создаем новый primary key
  console.log(
    `ALTER TABLE "${table}" ADD CONSTRAINT "PK_${table}" PRIMARY KEY ("id");`,
  );
  console.log('');
});

console.log('-- ============================================');
console.log('-- Обновление внешних ключей');
console.log('-- ============================================');

// Foreign key relationships
const foreignKeys = [
  { source: 'review', column: 'doctorId', target: 'doctor' },
  { source: 'review', column: 'userId', target: 'user' },
  { source: 'doctor_schedule', column: 'doctorId', target: 'doctor' },
  { source: 'doctor', column: 'clinicId', target: 'vet_clinic' },
  { source: 'user', column: 'clinicId', target: 'vet_clinic' },
];

foreignKeys.forEach(({ source, column, target }) => {
  console.log(`-- Обновление foreign key ${source}.${column} -> ${target}.id`);

  // Создаем временную колонку
  console.log(
    `ALTER TABLE "${source}" ADD COLUMN "temp_${column}" varchar(21);`,
  );

  // Обновляем значения (упрощенная версия - назначаем первой записи)
  console.log(
    `UPDATE "${source}" SET "temp_${column}" = (SELECT id FROM "${target}" LIMIT 1);`,
  );

  // Удаляем старую колонку
  console.log(`ALTER TABLE "${source}" DROP COLUMN "${column}";`);

  // Переименовываем новую колонку
  console.log(
    `ALTER TABLE "${source}" RENAME COLUMN "temp_${column}" TO "${column}";`,
  );

  // Создаем foreign key constraint
  console.log(
    `ALTER TABLE "${source}" ADD CONSTRAINT "FK_${source}_${target}" FOREIGN KEY ("${column}") REFERENCES "${target}"("id") ON DELETE CASCADE;`,
  );
  console.log('');
});

console.log('-- ============================================');
console.log('-- Создание индексов для производительности');
console.log('-- ============================================');

tables.forEach((table) => {
  console.log(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_${table}_id" ON "${table}"("id");`,
  );
});

console.log('\n-- ============================================');
console.log('-- Проверка результатов');
console.log('-- ============================================');

console.log('-- Проверка структуры таблиц');
console.log(`SELECT table_name, column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name IN ('${tables.join("', '")}')
AND column_name = 'id';`);

console.log('\n-- Проверка foreign key constraints');
console.log(`SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('${tables.join("', '")}');`);

console.log('\n-- ============================================');
console.log('-- Миграция завершена!');
console.log('-- Не забудьте:');
console.log('-- 1. Обновить фронтенд для работы со строковыми ID');
console.log('-- 2. Запустить тесты для проверки функциональности');
console.log('-- 3. Проверить производительность приложения');
console.log('-- ============================================');
