import { Pool, QueryResultRow, QueryResult } from 'pg';

// Get database name from environment variable, default to 'novo-okr'
const dbName = process.env.DB_NAME || 'novo-okr';

// PostgreSQL connection pool
const pool = new Pool({
  host: '104.154.167.98',
  port: 5432,
  user: 'postgres',
  password: 'pJsI8kvxE8qj5wpj',
  database: dbName,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10 seconds
  ssl: {
    rejectUnauthorized: false, // Allow self-signed certs
  },
});

// Log connection
pool.on('connect', () => {
  console.log(`Connected to PostgreSQL database: ${dbName}`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Helper to get the pool
export function getPool(): Pool {
  return pool;
}

// Query helper - executes a query and returns all rows
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

// Query helper - executes a query and returns first row or undefined
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<T | undefined> {
  const result = await pool.query<T>(text, params);
  return result.rows[0];
}

// Execute helper - for INSERT/UPDATE/DELETE, returns the result
export async function execute(
  text: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<QueryResult> {
  return pool.query(text, params);
}

// Helper to format dates for PostgreSQL
export function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
}

// Helper to get current timestamp
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export default pool;
