import cron from 'node-cron';
import sql from 'mssql';
import { getPool } from './db';
import pgPool from './postgres';

// ─── Full-dataset SQL Server query (no pagination, no filters) ───────────────
const SYNC_QUERY = `
WITH UnpaidFollowUps AS (
    SELECT FollowUpNumber, SUM(Debit) - SUM(Credit) AS TotalBalance
    FROM FIN3.VoucherItem
    WHERE SLRef = 248
      AND FollowUpNumber IS NOT NULL
      AND FollowUpNumber <> ''
    GROUP BY FollowUpNumber
    HAVING SUM(Debit) - SUM(Credit) > 0
),
CustomerBalance AS (
    SELECT FollowUpNumber, DLLevel5,
           SUM(ISNULL(Debit,0)) - SUM(ISNULL(Credit,0)) AS CustomerBalance
    FROM FIN3.VoucherItem
    WHERE SLRef = 248
      AND FollowUpNumber IS NOT NULL
      AND FollowUpNumber <> ''
    GROUP BY FollowUpNumber, DLLevel5
),
PaymentCheques AS (
    SELECT vr.VoucherRef, rn.SerialNumber, rn.DueDate, b.Name AS BankName
    FROM FIN3.VoucherReference vr
    JOIN RPA3.PaymentRestoreReceivableNote prn ON prn.PaymentRef = vr.OriginalReferenceID
    JOIN RPA3.ReceivableNote rn ON rn.ReceivableNoteID = prn.ReceivableNoteRef
    JOIN RPA3.Bank b ON b.BankID = rn.BankRef
    WHERE vr.OriginalEntityCode = 374

    UNION ALL

    SELECT vr.VoucherRef, rn.SerialNumber, rn.DueDate, b.Name AS BankName
    FROM FIN3.VoucherReference vr
    JOIN RPA3.PaymentDeliverReceivableCheque pdc ON pdc.PaymentRef = vr.OriginalReferenceID
    JOIN RPA3.ReceivableNote rn ON rn.ReceivableNoteID = pdc.ReceivableNoteRef
    JOIN RPA3.Bank b ON b.BankID = rn.BankRef
    WHERE vr.OriginalEntityCode = 374

    UNION ALL

    SELECT vr.VoucherRef, rn.SerialNumber, rn.DueDate, b.Name AS BankName
    FROM FIN3.VoucherReference vr
    JOIN RPA3.ReceivableNote rn ON rn.ReceivableNoteID = vr.OriginalReferenceID
    JOIN RPA3.Bank b ON b.BankID = rn.BankRef
    WHERE vr.OriginalEntityCode = 356
)
SELECT
    vi.VoucherRef,
    v.Number  AS VoucherNumber,
    vr.ReferenceNumber AS elamiye,
    pc.BankName,
    pc.SerialNumber AS ChequeNumber,
    CONVERT(DATE, pc.DueDate)  AS DueDate,
    CONVERT(DATE, v.Date)      AS VoucherDate,
    vi.DLLevel4,
    dl4.Title AS DLTitle_Level4,
    vi.DLLevel5,
    dl5.Title AS DLTitle_Level5,
    CAST(vi.Debit           AS BIGINT) AS Debit,
    CAST(u.TotalBalance     AS BIGINT) AS TotalBalance,
    CAST(cb.CustomerBalance AS BIGINT) AS CustomerBalance,
    vi.FollowUpNumber,
    vi.Description
FROM FIN3.VoucherItem vi
JOIN FIN3.Voucher v          ON v.VoucherID       = vi.VoucherRef
JOIN UnpaidFollowUps u       ON u.FollowUpNumber  = vi.FollowUpNumber
LEFT JOIN CustomerBalance cb ON cb.FollowUpNumber = vi.FollowUpNumber
    AND cb.DLLevel5 = vi.DLLevel5
LEFT JOIN FIN3.VoucherReference vr ON vr.VoucherRef = vi.VoucherRef
LEFT JOIN FIN3.DL dl4 ON dl4.Code = vi.DLLevel4
LEFT JOIN FIN3.DL dl5 ON dl5.Code = vi.DLLevel5
OUTER APPLY (
    SELECT TOP 1 SerialNumber, DueDate, BankName
    FROM PaymentCheques pc
    WHERE pc.VoucherRef = vi.VoucherRef
) pc
WHERE vi.SLRef = 248
`;

// ─── UPSERT a batch of rows into PostgreSQL ──────────────────────────────────
async function upsertBatch(rows: sql.IRecordSet<Record<string, unknown>>): Promise<void> {
  if (rows.length === 0) return;

  // Build a multi-row VALUES clause with numbered placeholders
  const COLS = 16; // number of value columns (excluding synced_at)
  const values: unknown[] = [];
  const placeholders = rows.map((_, i) => {
    const base = i * COLS;
    return `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9},$${base+10},$${base+11},$${base+12},$${base+13},$${base+14},$${base+15},$${base+16})`;
  });

  for (const r of rows) {
    values.push(
      r.VoucherRef,
      r.VoucherNumber ?? null,
      r.elamiye       ?? null,
      r.BankName      ?? null,
      r.ChequeNumber  ?? null,
      r.DueDate       ?? null,
      r.VoucherDate   ?? null,
      r.DLLevel4      ?? null,
      r.DLTitle_Level4 ?? null,
      r.DLLevel5      ?? null,
      r.DLTitle_Level5 ?? null,
      r.Debit         ?? null,
      r.TotalBalance  ?? null,
      r.CustomerBalance ?? null,
      r.FollowUpNumber,
      r.Description   ?? null,
    );
  }

  await pgPool.query(
    `INSERT INTO returned_cheques
       (voucher_ref, voucher_number, elamiye, bank_name, cheque_number,
        due_date, voucher_date, dl_level4, dl_title_level4,
        dl_level5, dl_title_level5, debit, total_balance,
        customer_balance, followup_number, description)
     VALUES ${placeholders.join(',')}
     ON CONFLICT (voucher_ref, followup_number) DO UPDATE SET
       voucher_number   = EXCLUDED.voucher_number,
       elamiye          = EXCLUDED.elamiye,
       bank_name        = EXCLUDED.bank_name,
       cheque_number    = EXCLUDED.cheque_number,
       due_date         = EXCLUDED.due_date,
       voucher_date     = EXCLUDED.voucher_date,
       dl_level4        = EXCLUDED.dl_level4,
       dl_title_level4  = EXCLUDED.dl_title_level4,
       dl_level5        = EXCLUDED.dl_level5,
       dl_title_level5  = EXCLUDED.dl_title_level5,
       debit            = EXCLUDED.debit,
       total_balance    = EXCLUDED.total_balance,
       customer_balance = EXCLUDED.customer_balance,
       description      = EXCLUDED.description,
       synced_at        = NOW()`,
    values,
  );
}

// ─── Lock flag — prevents overlapping executions ────────────────────────────
let syncRunning = false;

export async function runSync(): Promise<void> {
  if (syncRunning) {
    console.log('[sync] skipped — previous run still in progress');
    return;
  }
  syncRunning = true;
  const start = Date.now();
  console.log(`[sync] started at ${new Date().toISOString()}`);

  try {
    const mssqlPool = await getPool();
    const result = await mssqlPool.request().query(SYNC_QUERY);
    const rows = result.recordset;

    const BATCH = 500;
    for (let i = 0; i < rows.length; i += BATCH) {
      await upsertBatch(rows.slice(i, i + BATCH) as sql.IRecordSet<Record<string, unknown>>);
    }

    const elapsed = Date.now() - start;
    console.log(`[sync] success — ${rows.length} rows upserted in ${elapsed}ms`);
  } catch (err) {
    console.error(`[sync] failed after ${Date.now() - start}ms:`, err);
  } finally {
    syncRunning = false;
  }
}

// ─── Cron: every 30 min, 09:00–18:30 ────────────────────────────────────────
export function startSyncCron(): void {
  cron.schedule('*/30 9-18 * * *', () => {
    runSync().catch((err) => console.error('[sync] unhandled cron error:', err));
  });
  console.log('[sync] cron scheduled (*/30 9-18 * * *)');
}
