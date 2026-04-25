import { Pool, types } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Return BIGINT (int8) as JS numbers
types.setTypeParser(types.builtins.INT8, (val: string) => parseInt(val, 10));

const pool = new Pool({
  host:     process.env.PG_HOST     ?? 'localhost',
  port:     parseInt(process.env.PG_PORT ?? '5432', 10),
  database: process.env.PG_DATABASE,
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: 20,
  idleTimeoutMillis:    30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[postgres] idle client error:', err);
});

export default pool;
