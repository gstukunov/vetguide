import AppDataSource from '../config/database.config';
import * as path from 'path';
import * as fs from 'fs';

async function showMigrations() {
  try {
    console.log('🔄 Connecting to database...');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Get all migration files from the migrations directory
    const migrationsDir = path.join(process.cwd(), 'src', 'migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.ts'))
      .map((file) => path.join(migrationsDir, file));

    // Read migration files and extract migration names
    const migrationNames = migrationFiles.map((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      // Extract the name property from the migration class (e.g., name = 'InitialSchema1735689600000')
      const nameMatch = content.match(/name\s*=\s*['"]([^'"]+)['"]/);
      const filename = path.basename(file, '.ts');
      const timestampMatch = filename.match(/^(\d+)/);

      if (nameMatch && timestampMatch) {
        return {
          timestamp: parseInt(timestampMatch[1]),
          name: nameMatch[1],
          file: filename,
          fullPath: file,
        };
      }
      return null;
    });

    const validMigrations = migrationNames
      .filter((m) => m !== null)
      .sort((a, b) => a!.timestamp - b!.timestamp);

    // Get executed migrations from database
    const executedMigrations = await AppDataSource.query(
      'SELECT * FROM migrations ORDER BY timestamp DESC',
    );

    const executedMap = new Map(
      executedMigrations.map((m: any) => [m.name, m]),
    );

    console.log('\n📊 Migration Status:\n');
    console.log('─'.repeat(80));

    let pendingCount = 0;
    let executedCount = 0;

    if (validMigrations.length === 0) {
      console.log('No migration files found.');
    } else {
      validMigrations.forEach((migration) => {
        const executed = executedMap.has(migration!.name);
        const executedMigration = executedMap.get(migration!.name) as any;
        const status = executed ? '✅ EXECUTED' : '⏳ PENDING';
        const date =
          executed && executedMigration?.timestamp
            ? new Date(parseInt(executedMigration.timestamp)).toLocaleString()
            : '';

        console.log(
          `${status.padEnd(15)} | ${migration!.name.padEnd(50)} | ${date}`,
        );

        if (executed) {
          executedCount++;
        } else {
          pendingCount++;
        }
      });

      console.log('─'.repeat(80));
      console.log(`\nSummary:`);
      console.log(`  ✅ Executed: ${executedCount}`);
      console.log(`  ⏳ Pending:  ${pendingCount}`);
      console.log(`  📁 Total:    ${validMigrations.length}`);
    }

    // Show pending migrations
    const pendingMigrations = await AppDataSource.showMigrations();
    if (Array.isArray(pendingMigrations) && pendingMigrations.length > 0) {
      console.log(`\n⏳ Pending migrations to be executed:`);
      pendingMigrations.forEach((migration) => {
        console.log(`   - ${migration}`);
      });
    } else if (pendingCount > 0) {
      console.log(`\n⏳ Note: ${pendingCount} migration(s) are pending`);
    }

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to show migrations:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy().catch(() => {
        // Ignore errors during cleanup
      });
    }
    process.exit(1);
  }
}

showMigrations();
