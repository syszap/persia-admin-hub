import pool from '../../postgres';

// ─── Categories ───────────────────────────────────────────────────────────────
export async function findAllCategories(search: string) {
  const s = search ? `%${search}%` : '%';
  const result = await pool.query(
    'SELECT * FROM categories WHERE name ILIKE $1 OR name_fa ILIKE $1 ORDER BY name',
    [s],
  );
  return result.rows;
}

export async function createCategory(dto: { name: string; nameFa: string; slug: string; parentId?: string; description?: string }) {
  const result = await pool.query(
    'INSERT INTO categories (name, name_fa, slug, parent_id, description) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [dto.name, dto.nameFa, dto.slug, dto.parentId ?? null, dto.description ?? null],
  );
  return result.rows[0];
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function findAllProducts(search: string, categoryId: string | undefined, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const s = search ? `%${search}%` : '%';
  const conditions = ['(p.name ILIKE $1 OR p.name_fa ILIKE $1 OR p.code ILIKE $1)'];
  const vals: unknown[] = [s];
  let i = 2;
  if (categoryId) { conditions.push(`p.category_id=$${i++}`); vals.push(categoryId); }
  const where = conditions.join(' AND ');

  const [data, count] = await Promise.all([
    pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p LEFT JOIN categories c ON c.id=p.category_id
       WHERE ${where} ORDER BY p.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
      [...vals, limit, offset],
    ),
    pool.query(`SELECT COUNT(*) AS count FROM products p WHERE ${where}`, vals),
  ]);
  return { rows: data.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function findProductById(id: string) {
  const result = await pool.query(
    'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=$1',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function createProduct(dto: {
  code: string; name: string; nameFa: string; categoryId: string;
  description?: string; price: number; costPrice: number; unit: string; minStockLevel: number;
}) {
  const result = await pool.query(
    `INSERT INTO products (code, name, name_fa, category_id, description, price, cost_price, unit, min_stock_level)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [dto.code, dto.name, dto.nameFa, dto.categoryId, dto.description ?? null, dto.price, dto.costPrice, dto.unit, dto.minStockLevel],
  );
  return result.rows[0];
}

export async function updateProduct(id: string, dto: Partial<{
  name: string; nameFa: string; price: number; costPrice: number; status: string;
  description: string; minStockLevel: number; categoryId: string;
}>) {
  const fields: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (dto.name !== undefined) { fields.push(`name=$${i++}`); vals.push(dto.name); }
  if (dto.nameFa !== undefined) { fields.push(`name_fa=$${i++}`); vals.push(dto.nameFa); }
  if (dto.price !== undefined) { fields.push(`price=$${i++}`); vals.push(dto.price); }
  if (dto.costPrice !== undefined) { fields.push(`cost_price=$${i++}`); vals.push(dto.costPrice); }
  if (dto.status !== undefined) { fields.push(`status=$${i++}`); vals.push(dto.status); }
  if (dto.description !== undefined) { fields.push(`description=$${i++}`); vals.push(dto.description); }
  if (dto.minStockLevel !== undefined) { fields.push(`min_stock_level=$${i++}`); vals.push(dto.minStockLevel); }
  if (dto.categoryId !== undefined) { fields.push(`category_id=$${i++}`); vals.push(dto.categoryId); }
  if (!fields.length) return findProductById(id);
  fields.push('updated_at=NOW()');
  vals.push(id);
  const res = await pool.query(
    `UPDATE products SET ${fields.join(',')} WHERE id=$${i} RETURNING *`,
    vals,
  );
  return res.rows[0] ?? null;
}

export async function deleteProduct(id: string) {
  const res = await pool.query('DELETE FROM products WHERE id=$1', [id]);
  return (res.rowCount ?? 0) > 0;
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export async function addInventoryMovement(dto: {
  productId: string; type: string; quantity: number; unitCost?: number;
  referenceType?: string; referenceId?: string; notes?: string; createdBy: string;
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const movement = await client.query(
      `INSERT INTO inventory_movements (product_id, type, quantity, unit_cost, reference_type, reference_id, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [dto.productId, dto.type, dto.quantity, dto.unitCost ?? null, dto.referenceType ?? null, dto.referenceId ?? null, dto.notes ?? null, dto.createdBy],
    );
    const delta = dto.type === 'in' ? dto.quantity : -dto.quantity;
    await client.query('UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id=$2', [delta, dto.productId]);
    await client.query('COMMIT');
    return movement.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getLowStockProducts() {
  const result = await pool.query(
    'SELECT * FROM products WHERE stock_quantity <= min_stock_level AND status=\'active\' ORDER BY stock_quantity',
  );
  return result.rows;
}
