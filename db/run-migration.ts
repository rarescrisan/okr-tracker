import { readFileSync } from 'fs';
import { getPool } from '../src/lib/db';

async function runMigration() {
  const pool = getPool();

  try {
    const sql = readFileSync('./db/migrations/002_add_task_progress.sql', 'utf-8');
    console.log('Running migration: 002_add_task_progress.sql');
    console.log(sql);

    await pool.query(sql);
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
