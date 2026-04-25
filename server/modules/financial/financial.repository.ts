import pool from '../../postgres';
import type { Account, Transaction, TransactionEntry, Receipt, Payment, LedgerEntry, AccountBalance } from '../../../packages/shared/src/types/financial';

// ─── Accounts ─────────────────────────────────────────────────────────────────
export async function findAllAccounts(search: string, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const s = search ? `%${search}%` : '%';
  const [data, count] = await Promise.all([
    pool.query(
      `SELECT a.id, a.code, a.name, a.name_fa, a.type, a.parent_id, a.is_active, a.description,
              a.created_at, a.updated_at,
              COALESCE(
                SUM(CASE WHEN te.entry_type = 'debit' THEN te.amount ELSE -te.amount END), 0
              ) AS balance
       FROM accounts a
       LEFT JOIN transaction_entries te ON te.account_id = a.id
       LEFT JOIN transactions t ON t.id = te.transaction_id AND t.status = 'posted'
       WHERE a.name ILIKE $1 OR a.name_fa ILIKE $1 OR a.code ILIKE $1
       GROUP BY a.id
       ORDER BY a.code
       LIMIT $2 OFFSET $3`,
      [s, limit, offset],
    ),
    pool.query('SELECT COUNT(*) AS count FROM accounts WHERE name ILIKE $1 OR name_fa ILIKE $1 OR code ILIKE $1', [s]),
  ]);
  return { rows: data.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function findAccountById(id: string) {
  const result = await pool.query(
    `SELECT a.*, COALESCE(SUM(CASE WHEN te.entry_type='debit' THEN te.amount ELSE -te.amount END),0) AS balance
     FROM accounts a
     LEFT JOIN transaction_entries te ON te.account_id=a.id
     LEFT JOIN transactions t ON t.id=te.transaction_id AND t.status='posted'
     WHERE a.id=$1 GROUP BY a.id`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function createAccount(dto: {
  code: string; name: string; nameFa: string; type: string; parentId?: string; description?: string;
}) {
  const result = await pool.query(
    `INSERT INTO accounts (code, name, name_fa, type, parent_id, description)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [dto.code, dto.name, dto.nameFa, dto.type, dto.parentId ?? null, dto.description ?? null],
  );
  return result.rows[0];
}

export async function updateAccount(id: string, dto: Partial<{ name: string; nameFa: string; isActive: boolean; description: string }>) {
  const fields: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (dto.name !== undefined) { fields.push(`name=$${i++}`); vals.push(dto.name); }
  if (dto.nameFa !== undefined) { fields.push(`name_fa=$${i++}`); vals.push(dto.nameFa); }
  if (dto.isActive !== undefined) { fields.push(`is_active=$${i++}`); vals.push(dto.isActive); }
  if (dto.description !== undefined) { fields.push(`description=$${i++}`); vals.push(dto.description); }
  if (!fields.length) return findAccountById(id);
  fields.push('updated_at=NOW()');
  vals.push(id);
  const res = await pool.query(
    `UPDATE accounts SET ${fields.join(',')} WHERE id=$${i} RETURNING *`,
    vals,
  );
  return res.rows[0] ?? null;
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function findAllTransactions(search: string, status: string | undefined, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const s = search ? `%${search}%` : '%';
  const conditions = ['(t.description ILIKE $1 OR t.reference_number ILIKE $1)'];
  const vals: unknown[] = [s];
  let i = 2;
  if (status) { conditions.push(`t.status=$${i++}`); vals.push(status); }
  const where = conditions.join(' AND ');

  const [data, count] = await Promise.all([
    pool.query(
      `SELECT t.id, t.reference_number, t.date, t.description, t.status, t.total_amount,
              t.created_by, t.approved_by, t.created_at, t.updated_at,
              u.username AS created_by_name
       FROM transactions t
       LEFT JOIN users u ON u.id = t.created_by
       WHERE ${where}
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT $${i} OFFSET $${i+1}`,
      [...vals, limit, offset],
    ),
    pool.query(`SELECT COUNT(*) AS count FROM transactions t WHERE ${where}`, vals),
  ]);
  return { rows: data.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function findTransactionById(id: string) {
  const [tx, entries] = await Promise.all([
    pool.query(
      `SELECT t.*, u.username AS created_by_name FROM transactions t
       LEFT JOIN users u ON u.id=t.created_by WHERE t.id=$1`,
      [id],
    ),
    pool.query(
      `SELECT te.*, a.code AS account_code, a.name AS account_name
       FROM transaction_entries te JOIN accounts a ON a.id=te.account_id
       WHERE te.transaction_id=$1`,
      [id],
    ),
  ]);
  if (!tx.rows[0]) return null;
  return { ...tx.rows[0], entries: entries.rows };
}

export async function createTransaction(dto: {
  date: string;
  description: string;
  entries: Array<{ accountId: string; entryType: string; amount: number; description?: string }>;
  createdBy: string;
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Generate reference number
    const { rows: [seq] } = await client.query<{ nextval: string }>(
      "SELECT nextval('transaction_seq') AS nextval"
    );
    const ref = `JRN-${new Date().getFullYear()}-${String(seq.nextval).padStart(6, '0')}`;

    const totalAmount = dto.entries
      .filter(e => e.entryType === 'debit')
      .reduce((s, e) => s + e.amount, 0);

    const txResult = await client.query(
      `INSERT INTO transactions (reference_number, date, description, status, total_amount, created_by)
       VALUES ($1,$2,$3,'draft',$4,$5) RETURNING *`,
      [ref, dto.date, dto.description, totalAmount, dto.createdBy],
    );
    const tx = txResult.rows[0];

    for (const entry of dto.entries) {
      await client.query(
        `INSERT INTO transaction_entries (transaction_id, account_id, entry_type, amount, description)
         VALUES ($1,$2,$3,$4,$5)`,
        [tx.id, entry.accountId, entry.entryType, entry.amount, entry.description ?? null],
      );
    }

    await client.query('COMMIT');
    return findTransactionById(tx.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function postTransaction(id: string, approvedBy: string) {
  const result = await pool.query(
    `UPDATE transactions SET status='posted', approved_by=$1, updated_at=NOW()
     WHERE id=$2 AND status='draft' RETURNING *`,
    [approvedBy, id],
  );
  return result.rows[0] ?? null;
}

export async function voidTransaction(id: string) {
  const result = await pool.query(
    `UPDATE transactions SET status='void', updated_at=NOW()
     WHERE id=$1 AND status='posted' RETURNING *`,
    [id],
  );
  return result.rows[0] ?? null;
}

// ─── Ledger ───────────────────────────────────────────────────────────────────
export async function getAccountLedger(
  accountId: string,
  fromDate: string,
  toDate: string,
): Promise<LedgerEntry[]> {
  const result = await pool.query(
    `SELECT t.date, t.reference_number, t.description,
            SUM(CASE WHEN te.entry_type='debit' THEN te.amount ELSE 0 END) AS debit,
            SUM(CASE WHEN te.entry_type='credit' THEN te.amount ELSE 0 END) AS credit
     FROM transaction_entries te
     JOIN transactions t ON t.id=te.transaction_id AND t.status='posted'
     WHERE te.account_id=$1
       AND ($2::date IS NULL OR t.date >= $2::date)
       AND ($3::date IS NULL OR t.date <= $3::date)
     GROUP BY t.date, t.reference_number, t.description
     ORDER BY t.date, t.reference_number`,
    [accountId, fromDate || null, toDate || null],
  );

  let balance = 0;
  return result.rows.map((r) => {
    balance += Number(r.debit) - Number(r.credit);
    return {
      date: r.date,
      referenceNumber: r.reference_number,
      description: r.description,
      debit: Number(r.debit),
      credit: Number(r.credit),
      balance,
    };
  });
}

export async function getTrialBalance(): Promise<AccountBalance[]> {
  const result = await pool.query(`
    SELECT a.id AS account_id, a.code AS account_code, a.name AS account_name, a.type AS account_type,
           COALESCE(SUM(CASE WHEN te.entry_type='debit' THEN te.amount ELSE 0 END),0) AS debit_total,
           COALESCE(SUM(CASE WHEN te.entry_type='credit' THEN te.amount ELSE 0 END),0) AS credit_total
    FROM accounts a
    LEFT JOIN transaction_entries te ON te.account_id=a.id
    LEFT JOIN transactions t ON t.id=te.transaction_id AND t.status='posted'
    GROUP BY a.id, a.code, a.name, a.type
    ORDER BY a.code
  `);
  return result.rows.map((r) => ({
    accountId: r.account_id,
    accountCode: r.account_code,
    accountName: r.account_name,
    accountType: r.account_type,
    debitTotal: Number(r.debit_total),
    creditTotal: Number(r.credit_total),
    balance: Number(r.debit_total) - Number(r.credit_total),
  }));
}
