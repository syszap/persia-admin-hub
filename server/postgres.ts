import { Pool, types } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Return BIGINT (int8) as JS numbers — safe for financial amounts in this app
types.setTypeParser(types.builtins.INT8, (val: string) => parseInt(val, 10));

const pool = new Pool({
  host:     process.env.PG_HOST     ?? 'localhost',
  port:     parseInt(process.env.PG_PORT ?? '5432', 10),
  database: process.env.PG_DATABASE,
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: 10,
  idleTimeoutMillis:    30_000,
  connectionTimeoutMillis: 5_000,
});

export async function initDB(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS returned_cheques (
      id              SERIAL PRIMARY KEY,
      voucher_ref     INTEGER     NOT NULL,
      voucher_number  VARCHAR(100),
      elamiye         VARCHAR(100),
      bank_name       VARCHAR(200),
      cheque_number   VARCHAR(100),
      due_date        DATE,
      voucher_date    DATE,
      dl_level4       VARCHAR(50),
      dl_title_level4 VARCHAR(500),
      dl_level5       VARCHAR(50),
      dl_title_level5 VARCHAR(500),
      debit           BIGINT,
      total_balance   BIGINT,
      customer_balance BIGINT,
      followup_number VARCHAR(100) NOT NULL,
      description     TEXT,
      synced_at       TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT returned_cheques_unique UNIQUE (voucher_ref, followup_number)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      username      VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role          VARCHAR(50)  NOT NULL DEFAULT 'user'
                      CHECK (role IN ('admin', 'user')),
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export default pool;
