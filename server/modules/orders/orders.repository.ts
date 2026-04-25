import pool from '../../postgres';

// ─── Customers ────────────────────────────────────────────────────────────────
export async function findAllCustomers(search: string, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const s = search ? `%${search}%` : '%';
  const [data, count] = await Promise.all([
    pool.query(
      `SELECT * FROM customers WHERE name ILIKE $1 OR code ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [s, limit, offset],
    ),
    pool.query('SELECT COUNT(*) AS count FROM customers WHERE name ILIKE $1 OR code ILIKE $1', [s]),
  ]);
  return { rows: data.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function findCustomerById(id: string) {
  const result = await pool.query('SELECT * FROM customers WHERE id=$1', [id]);
  return result.rows[0] ?? null;
}

export async function createCustomer(dto: {
  code: string; name: string; email?: string; phone?: string;
  address?: string; city?: string; taxId?: string; creditLimit: number;
}) {
  const result = await pool.query(
    `INSERT INTO customers (code, name, email, phone, address, city, tax_id, credit_limit)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [dto.code, dto.name, dto.email ?? null, dto.phone ?? null, dto.address ?? null, dto.city ?? null, dto.taxId ?? null, dto.creditLimit],
  );
  return result.rows[0];
}

export async function updateCustomer(id: string, dto: Partial<{
  name: string; email: string; phone: string; address: string; city: string; taxId: string; creditLimit: number; isActive: boolean;
}>) {
  const fields: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (dto.name !== undefined) { fields.push(`name=$${i++}`); vals.push(dto.name); }
  if (dto.email !== undefined) { fields.push(`email=$${i++}`); vals.push(dto.email); }
  if (dto.phone !== undefined) { fields.push(`phone=$${i++}`); vals.push(dto.phone); }
  if (dto.address !== undefined) { fields.push(`address=$${i++}`); vals.push(dto.address); }
  if (dto.city !== undefined) { fields.push(`city=$${i++}`); vals.push(dto.city); }
  if (dto.isActive !== undefined) { fields.push(`is_active=$${i++}`); vals.push(dto.isActive); }
  if (dto.creditLimit !== undefined) { fields.push(`credit_limit=$${i++}`); vals.push(dto.creditLimit); }
  if (!fields.length) return findCustomerById(id);
  fields.push('updated_at=NOW()');
  vals.push(id);
  const res = await pool.query(`UPDATE customers SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
  return res.rows[0] ?? null;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function findAllOrders(search: string, status: string | undefined, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const s = search ? `%${search}%` : '%';
  const conditions = ['(o.order_number ILIKE $1 OR c.name ILIKE $1)'];
  const vals: unknown[] = [s];
  let i = 2;
  if (status) { conditions.push(`o.status=$${i++}`); vals.push(status); }
  const where = conditions.join(' AND ');

  const [data, count] = await Promise.all([
    pool.query(
      `SELECT o.*, c.name AS customer_name, c.code AS customer_code, u.username AS created_by_name
       FROM orders o
       JOIN customers c ON c.id=o.customer_id
       LEFT JOIN users u ON u.id=o.created_by
       WHERE ${where}
       ORDER BY o.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
      [...vals, limit, offset],
    ),
    pool.query(
      `SELECT COUNT(*) AS count FROM orders o JOIN customers c ON c.id=o.customer_id WHERE ${where}`,
      vals,
    ),
  ]);
  return { rows: data.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function findOrderById(id: string) {
  const [order, items] = await Promise.all([
    pool.query(
      `SELECT o.*, c.name AS customer_name, u.username AS created_by_name
       FROM orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN users u ON u.id=o.created_by
       WHERE o.id=$1`,
      [id],
    ),
    pool.query(
      `SELECT oi.*, p.name AS product_name, p.code AS product_code
       FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=$1`,
      [id],
    ),
  ]);
  if (!order.rows[0]) return null;
  return { ...order.rows[0], items: items.rows };
}

export async function createOrder(dto: {
  customerId: string; date: string; dueDate?: string; notes?: string; createdBy: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number; discount: number }>;
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Generate order number
    const year = new Date().getFullYear();
    const { rows: [seq] } = await client.query<{ count: string }>(
      `SELECT COUNT(*)+1 AS count FROM orders WHERE EXTRACT(YEAR FROM created_at)=$1`, [year],
    );
    const orderNumber = `ORD-${year}-${String(seq.count).padStart(6, '0')}`;

    const subtotal = dto.items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - i.discount / 100), 0);
    const discountTotal = dto.items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.discount / 100), 0);
    const total = subtotal;

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, customer_id, date, due_date, notes, subtotal, discount_total, total, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [orderNumber, dto.customerId, dto.date, dto.dueDate ?? null, dto.notes ?? null, subtotal, discountTotal, total, dto.createdBy],
    );
    const order = orderResult.rows[0];

    for (const item of dto.items) {
      const itemTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount, total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, item.productId, item.quantity, item.unitPrice, item.discount, itemTotal],
      );
      // Reduce inventory
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id=$2',
        [item.quantity, item.productId],
      );
    }

    await client.query('COMMIT');
    return findOrderById(order.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(id: string, status: string, approvedBy?: string) {
  const result = await pool.query(
    `UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
    [status, id],
  );
  return result.rows[0] ?? null;
}

export async function getOrderStats() {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total_orders,
      SUM(total) AS total_revenue,
      COUNT(*) FILTER (WHERE status='pending') AS pending_count,
      COUNT(*) FILTER (WHERE status='delivered') AS delivered_count,
      SUM(total) FILTER (WHERE payment_status='unpaid') AS outstanding_amount
    FROM orders
  `);
  return result.rows[0];
}
