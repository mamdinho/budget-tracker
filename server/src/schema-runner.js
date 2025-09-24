import 'dotenv/config';
import fs from 'fs';
import { Pool } from 'pg';

const sql = fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    await pool.query(sql);
    console.log('✅ Schema applied');
  } catch (e) {
    console.error('❌ Schema failed:', e);
  } finally {
    await pool.end();
  }
})();
