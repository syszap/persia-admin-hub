import pool from '../../postgres';
import bcrypt from 'bcrypt';
import { config } from '../../config/app.config';
import type { UserRole, Permission } from '../../../packages/shared/src/types/auth';

export interface UserRecord {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  permissions: Permission[];
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  username: string;
  password: string;
  email?: string;
  fullName?: string;
  role: UserRole;
  permissions?: Permission[];
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
  permissions?: Permission[];
  password?: string;
}

export async function findAll(
  search: string,
  page: number,
  limit: number,
): Promise<{ rows: UserRecord[]; total: number }> {
  const offset = (page - 1) * limit;
  const searchParam = search ? `%${search}%` : '%';

  const [dataResult, countResult] = await Promise.all([
    pool.query<UserRecord>(
      `SELECT id, username, email, full_name, role, permissions, is_active, last_login_at, created_at, updated_at
       FROM users
       WHERE (username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1)
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [searchParam, limit, offset],
    ),
    pool.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM users WHERE username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1',
      [searchParam],
    ),
  ]);

  return { rows: dataResult.rows, total: parseInt(countResult.rows[0].count, 10) };
}

export async function findById(id: string): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    'SELECT id, username, email, full_name, role, permissions, is_active, last_login_at, created_at, updated_at FROM users WHERE id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function create(dto: CreateUserDto): Promise<UserRecord> {
  const hash = await bcrypt.hash(dto.password, config.bcrypt.saltRounds);
  const result = await pool.query<UserRecord>(
    `INSERT INTO users (username, email, full_name, password_hash, role, permissions)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, username, email, full_name, role, permissions, is_active, last_login_at, created_at, updated_at`,
    [dto.username, dto.email ?? null, dto.fullName ?? null, hash, dto.role, dto.permissions ?? []],
  );
  return result.rows[0];
}

export async function update(id: string, dto: UpdateUserDto): Promise<UserRecord | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (dto.email !== undefined) { fields.push(`email = $${i++}`); values.push(dto.email); }
  if (dto.fullName !== undefined) { fields.push(`full_name = $${i++}`); values.push(dto.fullName); }
  if (dto.role !== undefined) { fields.push(`role = $${i++}`); values.push(dto.role); }
  if (dto.isActive !== undefined) { fields.push(`is_active = $${i++}`); values.push(dto.isActive); }
  if (dto.permissions !== undefined) { fields.push(`permissions = $${i++}`); values.push(dto.permissions); }
  if (dto.password !== undefined) {
    const hash = await bcrypt.hash(dto.password, config.bcrypt.saltRounds);
    fields.push(`password_hash = $${i++}`);
    values.push(hash);
  }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query<UserRecord>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i}
     RETURNING id, username, email, full_name, role, permissions, is_active, last_login_at, created_at, updated_at`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
