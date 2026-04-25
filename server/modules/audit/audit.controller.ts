import { Request, Response, NextFunction } from 'express';
import pool from '../../postgres';
import { sendPaginated } from '../../utils/response';

export async function listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search = '', resource, action, page = 1, limit = 50 } = req.query as Record<string, string>;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const vals: unknown[] = [];
    let i = 1;

    if (search) { conditions.push(`(al.username ILIKE $${i} OR al.resource_id::text ILIKE $${i})`); vals.push(`%${search}%`); i++; }
    if (resource) { conditions.push(`al.resource=$${i++}`); vals.push(resource); }
    if (action) { conditions.push(`al.action=$${i++}`); vals.push(action); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [data, count] = await Promise.all([
      pool.query(
        `SELECT al.id, al.user_id, al.username, al.action, al.resource, al.resource_id,
                al.old_values, al.new_values, al.ip_address, al.created_at
         FROM audit_logs al ${where}
         ORDER BY al.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
        [...vals, Number(limit), offset],
      ),
      pool.query(`SELECT COUNT(*) AS count FROM audit_logs al ${where}`, vals),
    ]);

    sendPaginated(res, data.rows, parseInt(count.rows[0].count, 10), Number(page), Number(limit));
  } catch (err) { next(err); }
}
