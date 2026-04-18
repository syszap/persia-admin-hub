import { Router, Request, Response } from 'express';
import ExcelJS from 'exceljs';
import pgPool from '../postgres';
import * as cache from '../cache';

const router = Router();

// ─── Risk / alert thresholds ─────────────────────────────────────────────────
const RISK_HIGH_AMOUNT  = 500_000_000;
const RISK_HIGH_COUNT   = 5;
const RISK_MED_AMOUNT   = 50_000_000;
const RISK_MED_COUNT    = 2;
const ALERT_AMOUNT      = 2_000_000_000;
const ALERT_COUNT       = 20;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseSearch(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  return raw.trim().substring(0, 200);
}

function parseDate(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

type RiskLevel = 'high' | 'medium' | 'low';

function getRiskLevel(overdueAmount: number, overdueCount: number): RiskLevel {
  if (overdueAmount > RISK_HIGH_AMOUNT || overdueCount > RISK_HIGH_COUNT) return 'high';
  if (overdueAmount > RISK_MED_AMOUNT  || overdueCount > RISK_MED_COUNT)  return 'medium';
  return 'low';
}

interface Alert { type: 'high-risk'; message: string }

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

// ─── Base SELECT (camelCase aliases matching original SQL Server output) ──────
const BASE_SELECT = `
  SELECT
    voucher_ref        AS "VoucherRef",
    voucher_number     AS "VoucherNumber",
    elamiye,
    bank_name          AS "BankName",
    cheque_number      AS "ChequeNumber",
    due_date::text     AS "DueDate",
    voucher_date::text AS "VoucherDate",
    dl_level4          AS "DLLevel4",
    dl_title_level4    AS "DLTitle_Level4",
    dl_level5          AS "DLLevel5",
    dl_title_level5    AS "DLTitle_Level5",
    debit              AS "Debit",
    total_balance      AS "TotalBalance",
    customer_balance   AS "CustomerBalance",
    followup_number    AS "FollowUpNumber",
    description        AS "Description"
  FROM returned_cheques
`;

// ─── GET /api/returned-cheques/summary ───────────────────────────────────────
router.get('/summary', async (_req: Request, res: Response): Promise<void> => {
  const cacheKey = 'rc:summary';
  const cached = cache.get<object>(cacheKey);
  if (cached) { res.json(cached); return; }

  const start = Date.now();
  try {
    const result = await pgPool.query<{
      totalCount: string;
      totalAmount: number;
      overdueCount: string;
      overdueAmount: number;
    }>(`
      SELECT
        COUNT(*)                                                           AS "totalCount",
        COALESCE(SUM(debit), 0)                                           AS "totalAmount",
        COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE THEN 1 ELSE 0 END), 0) AS "overdueCount",
        COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE THEN debit ELSE 0 END), 0) AS "overdueAmount"
      FROM returned_cheques
    `);

    const elapsed = Date.now() - start;
    if (elapsed > 2000) console.warn(`[summary] slow query: ${elapsed}ms`);

    const row = result.rows[0];
    const payload = {
      totalCount:    parseInt(row.totalCount as unknown as string, 10),
      totalAmount:   row.totalAmount  as number,
      overdueCount:  parseInt(row.overdueCount as unknown as string, 10),
      overdueAmount: row.overdueAmount as number,
      alerts: buildAlerts(row.overdueAmount as number, parseInt(row.overdueCount as unknown as string, 10)),
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
    const result = await pgPool.query<{
      customerName: string;
      totalCheques: string;
      totalAmount: number;
      overdueCount: string;
      overdueAmount: number;
    }>(`
      SELECT
        COALESCE(dl_title_level5, N'نامشخص')                                    AS "customerName",
        COUNT(*)                                                                   AS "totalCheques",
        COALESCE(SUM(debit), 0)                                                   AS "totalAmount",
        COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE THEN 1 ELSE 0 END), 0)    AS "overdueCount",
        COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE THEN debit ELSE 0 END), 0) AS "overdueAmount"
      FROM returned_cheques
      GROUP BY dl_title_level5
      ORDER BY SUM(debit) DESC
    `);

    const elapsed = Date.now() - start;
    if (elapsed > 2000) console.warn(`[by-customer] slow query: ${elapsed}ms`);

    const data = result.rows.map((row) => ({
      customerName:  row.customerName,
      totalCheques:  parseInt(row.totalCheques, 10),
      totalAmount:   row.totalAmount  as number,
      overdueCount:  parseInt(row.overdueCount, 10),
      overdueAmount: row.overdueAmount as number,
      riskLevel: getRiskLevel(row.overdueAmount as number, parseInt(row.overdueCount, 10)),
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
    const params: unknown[] = [
      search   ?? null,
      fromDate ?? null,
      toDate   ?? null,
      limit + 1,
      offset,
    ];

    const result = await pgPool.query(
      `${BASE_SELECT}
       WHERE ($1::text    IS NULL OR dl_title_level5 ILIKE '%' || $1 || '%'
                                  OR cheque_number   ILIKE '%' || $1 || '%')
         AND ($2::date IS NULL OR due_date >= $2::date)
         AND ($3::date IS NULL OR due_date <= $3::date)
       ORDER BY voucher_ref
       LIMIT $4 OFFSET $5`,
      params,
    );

    const elapsed = Date.now() - start;
    if (elapsed > 2000) {
      console.warn(`[list] slow query: ${elapsed}ms (page=${page}, limit=${limit}, search=${search})`);
    }

    const rows    = result.rows;
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
    const params: unknown[] = [
      search   ?? null,
      fromDate ?? null,
      toDate   ?? null,
      5000,
    ];

    const result = await pgPool.query(
      `${BASE_SELECT}
       WHERE ($1::text    IS NULL OR dl_title_level5 ILIKE '%' || $1 || '%'
                                  OR cheque_number   ILIKE '%' || $1 || '%')
         AND ($2::date IS NULL OR due_date >= $2::date)
         AND ($3::date IS NULL OR due_date <= $3::date)
       ORDER BY voucher_ref
       LIMIT $4`,
      params,
    );

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

    result.rows.forEach((row) => sheet.addRow(row));

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
