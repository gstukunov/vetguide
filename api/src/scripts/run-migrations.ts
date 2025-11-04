import AppDataSource from '../config/database.config';

async function runMigrations() {
  try {
    console.log('🔄 Connecting to database...');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('🔄 Running migrations...');
    const migrations = await AppDataSource.runMigrations();

    if (migrations.length > 0) {
      console.log(`✅ Applied ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    } else {
      console.log('✅ No pending migrations');
    }

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
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

runMigrations();
