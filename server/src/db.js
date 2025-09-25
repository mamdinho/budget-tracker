import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Detect if we should use SSL (Railway/Render prod). Keep local dev (localhost) non-SSL.
const isProd = process.env.NODE_ENV === 'production';
const forced = /^(1|true|yes)$/i.test(process.env.DATABASE_SSL || ''); // optional override
const useSSL = forced || (isProd && !/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || ''));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // e.g. postgresql://user:pass@host:port/db?sslmode=require
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  max: Number(process.env.PGPOOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// Helpful logging if something goes wrong with idle clients
pool.on('error', (err) => {
  console.error('Unexpected PG idle client error', err);
});

// tiny self-test on boot
export async function assertDbConnection() {
  try {
    await pool.query('select 1');
    console.log('✅ PostgreSQL connected');
  } catch (e) {
    console.error('❌ PostgreSQL connection failed:', e.message);
  }
}
