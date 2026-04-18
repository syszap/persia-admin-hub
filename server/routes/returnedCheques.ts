import { Router, Request, Response } from 'express';
import sql from 'mssql';
import ExcelJS from 'exceljs';
import { getPool } from '../db';
import * as cache from '../cache';

const router = Router();

// ─── Risk / alert thresholds (tune via env or constants) ────────────────────
const RISK_HIGH_AMOUNT  = 500_000_000;   // 500 M
const RISK_HIGH_COUNT   = 5;
const RISK_MED_AMOUNT   = 50_000_000;    // 50 M
const RISK_MED_COUNT    = 2;
const ALERT_AMOUNT      = 2_000_000_000; // 2 B
const ALERT_COUNT       = 20;

// ─── Shared CTE block ───────────────────────────────────────────────────────
// PaymentCheques CTE is reused across all four query variants.
const CTE_BLOCK = `
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
)`;

// ─── Paginated / export query (original + optional filters) ─────────────────
const FILTERED_SELECT = `
SELECT
    vi.VoucherRef,
    v.Number AS VoucherNumber,
    vr.ReferenceNumber AS elamiye,
    pc.BankName,
    pc.SerialNumber AS ChequeNumber,
    CONVERT(DATE, pc.DueDate) AS DueDate,
    CONVERT(DATE, v.Date) AS VoucherDate,
    vi.DLLevel4,
    dl4.Title AS DLTitle_Level4,
    vi.DLLevel5,
    dl5.Title AS DLTitle_Level5,
    CAST(vi.Debit AS BIGINT) AS Debit,
    CAST(u.TotalBalance AS BIGINT) AS TotalBalance,
    CAST(cb.CustomerBalance AS BIGINT) AS CustomerBalance,
    vi.FollowUpNumber,
    vi.Description
FROM FIN3.VoucherItem vi
JOIN FIN3.Voucher v ON v.VoucherID = vi.VoucherRef
JOIN UnpaidFollowUps u ON u.FollowUpNumber = vi.FollowUpNumber
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
  AND (@search IS NULL OR dl5.Title LIKE '%' + @search + '%' OR pc.SerialNumber LIKE '%' + @search + '%')
  AND (@fromDate IS NULL OR CONVERT(DATE, pc.DueDate) >= @fromDate)
  AND (@toDate IS NULL OR CONVERT(DATE, pc.DueDate) <= @toDate)`;

const QUERY_PAGINATED = `${CTE_BLOCK} ${FILTERED_SELECT}
ORDER BY vi.VoucherRef
OFFSET @pageOffset ROWS FETCH NEXT @fetchCount ROWS ONLY`;

const QUERY_EXPORT = `${CTE_BLOCK} ${FILTERED_SELECT}
ORDER BY vi.VoucherRef
OFFSET 0 ROWS FETCH NEXT @exportLimit ROWS ONLY`;

// ─── Summary query (no filters — global health overview) ─────────────────────
const SUMMARY_QUERY = `${CTE_BLOCK},
MainData AS (
    SELECT
        CAST(ISNULL(vi.Debit, 0) AS BIGINT) AS Debit,
        CONVERT(DATE, pc.DueDate) AS DueDate
    FROM FIN3.VoucherItem vi
    JOIN FIN3.Voucher v ON v.VoucherID = vi.VoucherRef
    JOIN UnpaidFollowUps u ON u.FollowUpNumber = vi.FollowUpNumber
    LEFT JOIN FIN3.VoucherReference vr ON vr.VoucherRef = vi.VoucherRef
    LEFT JOIN FIN3.DL dl5 ON dl5.Code = vi.DLLevel5
    OUTER APPLY (
        SELECT TOP 1 DueDate
        FROM PaymentCheques pc
        WHERE pc.VoucherRef = vi.VoucherRef
    ) pc
    WHERE vi.SLRef = 248
)
SELECT
    COUNT(*) AS totalCount,
    CAST(ISNULL(SUM(Debit), 0) AS BIGINT) AS totalAmount,
    ISNULL(SUM(CASE WHEN DueDate < CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END), 0) AS overdueCount,
    CAST(ISNULL(SUM(CASE WHEN DueDate < CAST(GETDATE() AS DATE) THEN Debit ELSE 0 END), 0) AS BIGINT) AS overdueAmount
FROM MainData`;

// ─── By-customer query (global — no filters) ─────────────────────────────────
const BY_CUSTOMER_QUERY = `${CTE_BLOCK},
MainData AS (
    SELECT
        ISNULL(dl5.Title, N'نامشخص') AS customerName,
        CAST(ISNULL(vi.Debit, 0) AS BIGINT) AS Debit,
        CONVERT(DATE, pc.DueDate) AS DueDate
    FROM FIN3.VoucherItem vi
    JOIN FIN3.Voucher v ON v.VoucherID = vi.VoucherRef
    JOIN UnpaidFollowUps u ON u.FollowUpNumber = vi.FollowUpNumber
    LEFT JOIN FIN3.VoucherReference vr ON vr.VoucherRef = vi.VoucherRef
    LEFT JOIN FIN3.DL dl5 ON dl5.Code = vi.DLLevel5
    OUTER APPLY (
        SELECT TOP 1 DueDate
        FROM PaymentCheques pc
        WHERE pc.VoucherRef = vi.VoucherRef
    ) pc
    WHERE vi.SLRef = 248
)
SELECT
    customerName,
    COUNT(*) AS totalCheques,
    CAST(ISNULL(SUM(Debit), 0) AS BIGINT) AS totalAmount,
    ISNULL(SUM(CASE WHEN DueDate < CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END), 0) AS overdueCount,
    CAST(ISNULL(SUM(CASE WHEN DueDate < CAST(GETDATE() AS DATE) THEN Debit ELSE 0 END), 0) AS BIGINT) AS overdueAmount
FROM MainData
GROUP BY customerName
ORDER BY totalAmount DESC`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseSearch(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  return raw.trim().substring(0, 200);
}

function parseDate(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function bindFilters(
  request: sql.Request,
  search: string | null,
  fromDate: string | null,
  toDate: string | null
): sql.Request {
  return request
    .input('search',   sql.NVarChar(200), search)
    .input('fromDate', sql.Date, fromDate)
    .input('toDate',   sql.Date, toDate);
}

type RiskLevel = 'high' | 'medium' | 'low';

function getRiskLevel(overdueAmount: number, overdueCount: number): RiskLevel {
  if (overdueAmount > RISK_HIGH_AMOUNT || overdueCount > RISK_HIGH_COUNT) return 'high';
  if (overdueAmount > RISK_MED_AMOUNT  || overdueCount > RISK_MED_COUNT)  return 'medium';
  return 'low';
}

interface Alert {
  type: 'high-risk';
  message: string;
}

function buildAlerts(overdueAmount: number, overdueCount: number): Alert[] {
  const alerts: Alert[] = [];
  if (overdueAmount > ALERT_AMOUNT) {
    alerts.push({ type: 'high-risk', message: 'مجموع مبلغ چک‌های سررسید گذشته از حد هشدار عبور کرده است.' });
  }
  if (overdueCount > ALERT_COUNT) {
    alerts.push({ type: 'high-risk', message: `تعداد چک‌های سررسید گذشته (${overdueCount} فقره) از حد هشدار عبور کرده است.` });
  }
  return alerts;
}

// ─── GET /api/returned-cheques/summary ───────────────────────────────────────
router.get('/summary', async (_req: Request, res: Response): Promise<void> => {
  const cacheKey = 'rc:summary';
  const cached = cache.get<object>(cacheKey);
  if (cached) { res.json(cached); return; }

  const start = Date.now();
  try {
    const pool = await getPool();
    const result = await pool.request().query(SUMMARY_QUERY);
    const row = result.recordset[0] ?? { totalCount: 0, totalAmount: 0, overdueCount: 0, overdueAmount: 0 };

    const elapsed = Date.now() - start;
    if (elapsed > 2000) console.warn(`[summary] slow query: ${elapsed}ms`);

    const payload = {
      totalCount:   row.totalCount   as number,
      totalAmount:  row.totalAmount  as number,
      overdueCount: row.overdueCount as number,
      overdueAmount:row.overdueAmount as number,
      alerts: buildAlerts(row.overdueAmount as number, row.overdueCount as number),
    };

    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error(`[summary] failed after ${Date.now() - start}ms:`, err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ─── GET /api/returned-cheques/by-customer ───────────────────────────────────
router.get('/by-customer', async (_req: Request, res: Response): Promise<void> => {
  const cacheKey = 'rc:by-customer';
  const cached = cache.get<unknown[]>(cacheKey);
  if (cached) { res.json(cached); return; }

  const start = Date.now();
  try {
    const pool = await getPool();
    const result = await pool.request().query(BY_CUSTOMER_QUERY);

    const elapsed = Date.now() - start;
    if (elapsed > 2000) console.warn(`[by-customer] slow query: ${elapsed}ms`);

    const data = result.recordset.map((row) => ({
      customerName:  row.customerName  as string,
      totalCheques:  row.totalCheques  as number,
      totalAmount:   row.totalAmount   as number,
      overdueCount:  row.overdueCount  as number,
      overdueAmount: row.overdueAmount as number,
      riskLevel: getRiskLevel(row.overdueAmount as number, row.overdueCount as number),
    }));

    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error(`[by-customer] failed after ${Date.now() - start}ms:`, err);
    res.status(500).json({ error: 'Failed to fetch customer grouping' });
  }
});

// ─── GET /api/returned-cheques (paginated list with filters) ─────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const rawPage  = parseInt(req.query.page  as string, 10);
  const rawLimit = parseInt(req.query.limit as string, 10);

  const page   = Number.isFinite(rawPage)  && rawPage  > 0 ? rawPage  : 1;
  const limit  = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : 100;
  const offset = (page - 1) * limit;

  const search   = parseSearch(req.query.search);
  const fromDate = parseDate(req.query.fromDate);
  const toDate   = parseDate(req.query.toDate);

  const cacheKey = `rc:list:${page}:${limit}:${search ?? ''}:${fromDate ?? ''}:${toDate ?? ''}`;
  const cached = cache.get<object>(cacheKey);
  if (cached) { res.json(cached); return; }

  const start = Date.now();
  try {
    const pool = await getPool();
    const result = await bindFilters(pool.request(), search, fromDate, toDate)
      .input('pageOffset', sql.Int, offset)
      .input('fetchCount', sql.Int, limit + 1)
      .query(QUERY_PAGINATED);

    const elapsed = Date.now() - start;
    if (elapsed > 2000) {
      console.warn(`[list] slow query: ${elapsed}ms (page=${page}, limit=${limit}, search=${search})`);
    }

    const rows    = result.recordset;
    const hasMore = rows.length > limit;
    const payload = { data: hasMore ? rows.slice(0, limit) : rows, page, limit, hasMore };

    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error(`[list] failed after ${Date.now() - start}ms:`, err);
    res.status(500).json({ error: 'Failed to fetch returned cheques data' });
  }
});

// ─── GET /api/returned-cheques/export (NOT cached) ───────────────────────────
router.get('/export', async (req: Request, res: Response): Promise<void> => {
  const search   = parseSearch(req.query.search);
  const fromDate = parseDate(req.query.fromDate);
  const toDate   = parseDate(req.query.toDate);

  const start = Date.now();
  try {
    const pool = await getPool();
    const result = await bindFilters(pool.request(), search, fromDate, toDate)
      .input('exportLimit', sql.Int, 5000)
      .query(QUERY_EXPORT);

    const elapsed = Date.now() - start;
    if (elapsed > 2000) console.warn(`[export] slow query: ${elapsed}ms`);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Persia Admin Hub';
    const sheet = workbook.addWorksheet('چک برگشتی');

    sheet.columns = [
      { header: 'شماره سند',    key: 'VoucherNumber',    width: 15 },
      { header: 'اعلامیه',      key: 'elamiye',          width: 15 },
      { header: 'نام بانک',     key: 'BankName',         width: 22 },
      { header: 'شماره چک',     key: 'ChequeNumber',     width: 20 },
      { header: 'سررسید',       key: 'DueDate',          width: 14 },
      { header: 'تاریخ سند',    key: 'VoucherDate',      width: 14 },
      { header: 'سطح ۴',        key: 'DLTitle_Level4',   width: 28 },
      { header: 'سطح ۵',        key: 'DLTitle_Level5',   width: 28 },
      { header: 'مبلغ',         key: 'Debit',            width: 18 },
      { header: 'مانده کل',     key: 'TotalBalance',     width: 18 },
      { header: 'مانده مشتری',  key: 'CustomerBalance',  width: 18 },
      { header: 'شماره پیگیری', key: 'FollowUpNumber',   width: 15 },
      { header: 'شرح',          key: 'Description',      width: 35 },
    ];

    result.recordset.forEach((row) => sheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="returned-cheques.xlsx"');
    res.setHeader('Content-Length', buffer.byteLength);
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error(`[export] failed after ${Date.now() - start}ms:`, err);
    if (!res.headersSent) res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
