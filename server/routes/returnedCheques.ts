import { Router, Request, Response } from 'express';
import sql from 'mssql';
import { getPool } from '../db';

const router = Router();

// Original query is unchanged. ORDER BY + OFFSET/FETCH appended for SQL-level pagination.
// @pageOffset and @fetchCount are injected as typed parameters (no string interpolation).
const QUERY = `
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
ORDER BY vi.VoucherRef
OFFSET @pageOffset ROWS FETCH NEXT @fetchCount ROWS ONLY
`;

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const rawPage = parseInt(req.query.page as string, 10);
  const rawLimit = parseInt(req.query.limit as string, 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : 100;
  const offset = (page - 1) * limit;

  const start = Date.now();

  try {
    const pool = await getPool();

    // Fetch limit+1 rows to determine hasMore without a separate COUNT query
    const result = await pool
      .request()
      .input('pageOffset', sql.Int, offset)
      .input('fetchCount', sql.Int, limit + 1)
      .query(QUERY);

    const elapsed = Date.now() - start;

    if (elapsed > 2000) {
      console.warn(
        `[returned-cheques] slow query: ${elapsed}ms (page=${page}, limit=${limit}, offset=${offset})`
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

export default router;
