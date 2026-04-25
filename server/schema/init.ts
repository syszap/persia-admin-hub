import pool from '../postgres';
import { logger } from '../middlewares/logger';

export async function initSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ─── Extensions ──────────────────────────────────────────────────────────
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // ─── Sequences ───────────────────────────────────────────────────────────
    await client.query('CREATE SEQUENCE IF NOT EXISTS transaction_seq START 1');

    // ─── Tenants (multi-tenant) ───────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        slug        VARCHAR(100) UNIQUE NOT NULL,
        name        VARCHAR(200) NOT NULL,
        plan        VARCHAR(50)  NOT NULL DEFAULT 'free',
        is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
        settings    JSONB        NOT NULL DEFAULT '{}',
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Users ───────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id     UUID         REFERENCES tenants(id) ON DELETE CASCADE,
        username      VARCHAR(100) UNIQUE NOT NULL,
        email         VARCHAR(200) UNIQUE,
        full_name     VARCHAR(200),
        password_hash VARCHAR(255) NOT NULL,
        role          VARCHAR(50)  NOT NULL DEFAULT 'user'
                        CHECK (role IN ('owner','admin','finance_manager','product_manager','user','customer')),
        permissions   TEXT[]       NOT NULL DEFAULT '{}',
        is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
        last_login_at TIMESTAMPTZ,
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Refresh tokens ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash  VARCHAR(255) NOT NULL UNIQUE,
        expires_at  TIMESTAMPTZ NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)
    `);

    // ─── Audit logs ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id    UUID        REFERENCES tenants(id) ON DELETE SET NULL,
        user_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
        username     VARCHAR(100),
        action       VARCHAR(50)  NOT NULL,
        resource     VARCHAR(100) NOT NULL,
        resource_id  UUID,
        old_values   JSONB,
        new_values   JSONB,
        ip_address   VARCHAR(45),
        user_agent   TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
    `);

    // ─── Financial: Accounts (Chart of Accounts) ─────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id   UUID        REFERENCES tenants(id) ON DELETE CASCADE,
        code        VARCHAR(50)  NOT NULL,
        name        VARCHAR(200) NOT NULL,
        name_fa     VARCHAR(200) NOT NULL,
        type        VARCHAR(20)  NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
        parent_id   UUID         REFERENCES accounts(id) ON DELETE RESTRICT,
        is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
        description TEXT,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, code)
      )
    `);

    // ─── Financial: Transactions (Journal) ───────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id        UUID        REFERENCES tenants(id) ON DELETE CASCADE,
        reference_number VARCHAR(100) NOT NULL,
        date             DATE         NOT NULL,
        description      TEXT         NOT NULL,
        status           VARCHAR(20)  NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft','posted','void')),
        total_amount     NUMERIC(18,4) NOT NULL DEFAULT 0,
        created_by       UUID         REFERENCES users(id),
        approved_by      UUID         REFERENCES users(id),
        created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, reference_number)
      )
    `);

    // ─── Financial: Transaction Entries (Double-Entry) ────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS transaction_entries (
        id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID         NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        account_id     UUID         NOT NULL REFERENCES accounts(id),
        entry_type     VARCHAR(10)  NOT NULL CHECK (entry_type IN ('debit','credit')),
        amount         NUMERIC(18,4) NOT NULL CHECK (amount > 0),
        description    TEXT,
        created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_entries_transaction ON transaction_entries(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_entries_account ON transaction_entries(account_id);
    `);

    // ─── Financial: Receipts ─────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id        UUID        REFERENCES tenants(id) ON DELETE CASCADE,
        receipt_number   VARCHAR(100) NOT NULL,
        date             DATE         NOT NULL,
        payer_id         UUID         REFERENCES users(id),
        payer_name       VARCHAR(200) NOT NULL,
        account_id       UUID         NOT NULL REFERENCES accounts(id),
        amount           NUMERIC(18,4) NOT NULL CHECK (amount > 0),
        description      TEXT,
        reference_number VARCHAR(100),
        transaction_id   UUID         REFERENCES transactions(id),
        created_by       UUID         REFERENCES users(id),
        created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, receipt_number)
      )
    `);

    // ─── Financial: Payments ─────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id        UUID        REFERENCES tenants(id) ON DELETE CASCADE,
        payment_number   VARCHAR(100) NOT NULL,
        date             DATE         NOT NULL,
        payee_id         UUID         REFERENCES users(id),
        payee_name       VARCHAR(200) NOT NULL,
        account_id       UUID         NOT NULL REFERENCES accounts(id),
        amount           NUMERIC(18,4) NOT NULL CHECK (amount > 0),
        description      TEXT,
        reference_number VARCHAR(100),
        transaction_id   UUID         REFERENCES transactions(id),
        created_by       UUID         REFERENCES users(id),
        created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, payment_number)
      )
    `);

    // ─── Products: Categories ─────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id   UUID        REFERENCES tenants(id) ON DELETE CASCADE,
        name        VARCHAR(200) NOT NULL,
        name_fa     VARCHAR(200) NOT NULL,
        slug        VARCHAR(200) NOT NULL,
        parent_id   UUID         REFERENCES categories(id) ON DELETE SET NULL,
        description TEXT,
        is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, slug)
      )
    `);

    // ─── Products ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id       UUID         REFERENCES tenants(id) ON DELETE CASCADE,
        code            VARCHAR(50)  NOT NULL,
        name            VARCHAR(200) NOT NULL,
        name_fa         VARCHAR(200) NOT NULL,
        category_id     UUID         REFERENCES categories(id) ON DELETE SET NULL,
        description     TEXT,
        price           NUMERIC(18,4) NOT NULL DEFAULT 0,
        cost_price      NUMERIC(18,4) NOT NULL DEFAULT 0,
        unit            VARCHAR(20)  NOT NULL DEFAULT 'عدد',
        status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','inactive','discontinued')),
        stock_quantity  INTEGER      NOT NULL DEFAULT 0,
        min_stock_level INTEGER      NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, code)
      )
    `);

    // ─── Inventory movements ──────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id       UUID        REFERENCES tenants(id) ON DELETE CASCADE,
        product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        type            VARCHAR(20) NOT NULL CHECK (type IN ('in','out','adjustment')),
        quantity        INTEGER     NOT NULL,
        unit_cost       NUMERIC(18,4),
        reference_type  VARCHAR(50),
        reference_id    UUID,
        notes           TEXT,
        created_by      UUID        REFERENCES users(id),
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Customers ────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id    UUID         REFERENCES tenants(id) ON DELETE CASCADE,
        code         VARCHAR(50)  NOT NULL,
        name         VARCHAR(200) NOT NULL,
        email        VARCHAR(200),
        phone        VARCHAR(50),
        address      TEXT,
        city         VARCHAR(100),
        tax_id       VARCHAR(50),
        credit_limit NUMERIC(18,4) NOT NULL DEFAULT 0,
        balance      NUMERIC(18,4) NOT NULL DEFAULT 0,
        is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, code)
      )
    `);

    // ─── Orders ───────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id       UUID         REFERENCES tenants(id) ON DELETE CASCADE,
        order_number    VARCHAR(100) NOT NULL,
        customer_id     UUID         NOT NULL REFERENCES customers(id),
        date            DATE         NOT NULL,
        due_date        DATE,
        status          VARCHAR(30)  NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
        payment_status  VARCHAR(20)  NOT NULL DEFAULT 'unpaid'
                          CHECK (payment_status IN ('unpaid','partial','paid','refunded')),
        subtotal        NUMERIC(18,4) NOT NULL DEFAULT 0,
        discount_total  NUMERIC(18,4) NOT NULL DEFAULT 0,
        tax_total       NUMERIC(18,4) NOT NULL DEFAULT 0,
        total           NUMERIC(18,4) NOT NULL DEFAULT 0,
        paid_amount     NUMERIC(18,4) NOT NULL DEFAULT 0,
        notes           TEXT,
        created_by      UUID         REFERENCES users(id),
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, order_number)
      )
    `);

    // ─── Order items ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id    UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id  UUID         NOT NULL REFERENCES products(id),
        quantity    INTEGER      NOT NULL CHECK (quantity > 0),
        unit_price  NUMERIC(18,4) NOT NULL,
        discount    NUMERIC(5,2)  NOT NULL DEFAULT 0,
        total       NUMERIC(18,4) NOT NULL,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Returned cheques ────────────────────────────────────────────────────
    await client.query(`
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

    await client.query('COMMIT');
    logger.info('[schema] database schema initialized');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
