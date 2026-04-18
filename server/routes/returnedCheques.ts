import { Router, Request, Response } from 'express';
import sql from 'mssql';
import ExcelJS from 'exceljs';
import { getPool } from '../db';

const router = Router();

// CTEs + SELECT + JOINs are unchanged from the original query.
// WHERE clause extended with optional filter parameters (all default to NULL = bypass).
// @search, @fromDate, @toDate are shared across paginated and export variants.
const QUERY_BASE = `
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
  AND (@toDate IS NULL OR CONVERT(DATE, pc.DueDate) <= @toDate)
`;

const QUERY_PAGINATED = `${QUERY_BASE}
ORDER BY vi.VoucherRef
OFFSET @pageOffset ROWS FETCH NEXT @fetchCount ROWS ONLY`;

const QUERY_EXPORT = `${QUERY_BASE}
ORDER BY vi.VoucherRef
OFFSET 0 ROWS FETCH NEXT @exportLimit ROWS ONLY`;

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
    .input('search', sql.NVarChar(200), search)
    .input('fromDate', sql.Date, fromDate)
    .input('toDate', sql.Date, toDate);
}

// GET /api/returned-cheques
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const rawPage = parseInt(req.query.page as string, 10);
  const rawLimit = parseInt(req.query.limit as string, 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : 100;
  const offset = (page - 1) * limit;

  const search = parseSearch(req.query.search);
  const fromDate = parseDate(req.query.fromDate);
  const toDate = parseDate(req.query.toDate);

  const start = Date.now();

  try {
    const pool = await getPool();
    const result = await bindFilters(pool.request(), search, fromDate, toDate)
      .input('pageOffset', sql.Int, offset)
      .input('fetchCount', sql.Int, limit + 1)
      .query(QUERY_PAGINATED);

    const elapsed = Date.now() - start;
    if (elapsed > 2000) {
      console.warn(
        `[returned-cheques] slow query: ${elapsed}ms (page=${page}, limit=${limit}, search=${search})`
      );
    }

    const rows = result.recordset;
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;

    res.json({ data, page, limit, hasMore });
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`[returned-cheques] query failed after ${elapsed}ms:`, err);
    res.status(500).json({ error: 'Failed to fetch returned cheques data' });
  }
});

// GET /api/returned-cheques/export
router.get('/export', async (req: Request, res: Response): Promise<void> => {
  const search = parseSearch(req.query.search);
  const fromDate = parseDate(req.query.fromDate);
  const toDate = parseDate(req.query.toDate);

  const start = Date.now();

  try {
    const pool = await getPool();
    const result = await bindFilters(pool.request(), search, fromDate, toDate)
      .input('exportLimit', sql.Int, 5000)
      .query(QUERY_EXPORT);

    const elapsed = Date.now() - start;
    if (elapsed > 2000) {
      console.warn(`[returned-cheques/export] slow query: ${elapsed}ms`);
    }

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
    const elapsed = Date.now() - start;
    console.error(`[returned-cheques/export] failed after ${elapsed}ms:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Export failed' });
    }
  }
});

export default router;
