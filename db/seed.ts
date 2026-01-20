import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// Get database name from environment variable, default to 'novo-okr'
const dbName = process.env.DB_NAME || 'novo-okr';

// PostgreSQL connection
const pool = new Pool({
  host: '104.154.167.98',
  port: 5432,
  user: 'postgres',
  password: 'pJsI8kvxE8qj5wpj',
  database: dbName,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS run_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Migrations table ready');
}

async function getExecutedMigrations(): Promise<Set<string>> {
  const result = await pool.query('SELECT name FROM run_migrations');
  return new Set(result.rows.map(row => row.name));
}

async function recordMigration(name: string): Promise<void> {
  await pool.query('INSERT INTO run_migrations (name) VALUES ($1)', [name]);
}

async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(process.cwd(), 'db', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found');
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const executedMigrations = await getExecutedMigrations();

  for (const file of migrationFiles) {
    if (executedMigrations.has(file)) {
      console.log(`Skipping already executed migration: ${file}`);
      continue;
    }

    const migrationPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    try {
      await pool.query(sql);
      await recordMigration(file);
      console.log(`Executed migration: ${file}`);
    } catch (error) {
      console.error(`Error executing migration ${file}:`, error);
      throw error;
    }
  }
}

async function runSeedData(): Promise<void> {
  const seedDataPath = path.join(process.cwd(), 'db', 'seed-data.sql');

  if (!fs.existsSync(seedDataPath)) {
    console.log('No seed-data.sql found');
    return;
  }

  console.log('Running seed data...');
  const sql = fs.readFileSync(seedDataPath, 'utf-8');

  try {
    await pool.query(sql);
    console.log('Seed data loaded successfully');
  } catch (error) {
    console.error('Error loading seed data:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    console.log(`Connecting to PostgreSQL database: ${dbName}`);

    // Create migrations tracking table
    await createMigrationsTable();

    // Run pending migrations
    console.log('Running migrations...');
    await runMigrations();

    // Check if we should seed data (only if tables are empty)
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(result.rows[0].count, 10);

    if (userCount === 0) {
      console.log('Database is empty, running seed data...');
      await runSeedData();
    } else {
      console.log(`Database already has ${userCount} users, skipping seed data`);
      console.log('To force re-seed, run: npm run db:seed:force');
    }

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Force seed command
async function forceSeed(): Promise<void> {
  try {
    console.log(`Connecting to PostgreSQL database: ${dbName}`);

    // Create migrations tracking table
    await createMigrationsTable();

    // Run pending migrations
    console.log('Running migrations...');
    await runMigrations();

    // Force run seed data (will truncate and re-seed)
    console.log('Force seeding database...');
    await runSeedData();

    console.log('Database force seed completed successfully!');
  } catch (error) {
    console.error('Database force seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--force') || args.includes('-f')) {
  forceSeed();
} else {
  main();
}
