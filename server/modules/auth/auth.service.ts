import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../../postgres';
import { config } from '../../config/app.config';
import { AppError } from '../../middlewares/errorHandler';
import { cacheSet, cacheDel } from '../../config/redis.config';
import type { UserRole, Permission, AuthUser } from '../../../packages/shared/src/types/auth';
import { ROLE_PERMISSIONS } from '../../../packages/shared/src/types/auth';

interface UserRow {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  password_hash: string;
  role: UserRole;
  permissions: Permission[];
  is_active: boolean;
}

export interface TokenPair {
  token: string;
  refreshToken: string;
}

function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    username: row.username,
    email: row.email ?? undefined,
    fullName: row.full_name ?? undefined,
    role: row.role,
    isActive: row.is_active,
    permissions: row.permissions ?? [],
  };
}

function generateTokenPair(user: AuthUser): TokenPair {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] },
  );

  return { token, refreshToken };
}

export async function loginUser(
  username: string,
  password: string,
): Promise<{ tokens: TokenPair; user: AuthUser }> {
  const result = await pool.query<UserRow>(
    'SELECT id, username, email, full_name, password_hash, role, permissions, is_active FROM users WHERE username = $1',
    [username],
  );

  if (result.rows.length === 0) {
    throw new AppError('نام کاربری یا کلمه عبور اشتباه است', 401, 'INVALID_CREDENTIALS');
  }

  const row = result.rows[0];

  if (!row.is_active) {
    throw new AppError('حساب کاربری غیرفعال است', 403, 'ACCOUNT_INACTIVE');
  }

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    throw new AppError('نام کاربری یا کلمه عبور اشتباه است', 401, 'INVALID_CREDENTIALS');
  }

  const user = buildUser(row);
  const tokens = generateTokenPair(user);

  // Store hashed refresh token
  const tokenHash = hashRefreshToken(tokens.refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, tokenHash, expiresAt],
  );

  // Update last login
  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

  return { tokens, user };
}

export async function refreshAccessToken(
  rawRefreshToken: string,
): Promise<{ tokens: TokenPair; user: AuthUser }> {
  let payload: { id: string; type: string };
  try {
    payload = jwt.verify(rawRefreshToken, config.jwt.refreshSecret) as { id: string; type: string };
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const tokenHash = hashRefreshToken(rawRefreshToken);
  const stored = await pool.query<{ user_id: string; expires_at: Date }>(
    'SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2',
    [tokenHash, payload.id],
  );

  if (stored.rows.length === 0 || stored.rows[0].expires_at < new Date()) {
    throw new AppError('Refresh token not found or expired', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Rotate: delete old, issue new
  await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);

  const userResult = await pool.query<UserRow>(
    'SELECT id, username, email, full_name, password_hash, role, permissions, is_active FROM users WHERE id = $1',
    [payload.id],
  );
  if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
    throw new AppError('User not found or inactive', 401);
  }

  const user = buildUser(userResult.rows[0]);
  const tokens = generateTokenPair(user);

  const newHash = hashRefreshToken(tokens.refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, newHash, expiresAt],
  );

  return { tokens, user };
}

export async function logoutUser(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  await cacheDel(`user:${userId}`);
}

export async function seedDefaultUsers(): Promise<void> {
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM users');
  if (parseInt(rows[0].count, 10) > 0) return;

  const hash = await bcrypt.hash('Admin@1234', config.bcrypt.saltRounds);
  await pool.query(
    `INSERT INTO users (username, email, full_name, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)`,
    ['admin', 'admin@persia.local', 'مدیر سیستم', hash, 'owner'],
  );
  console.log('[seed] default admin user created (username: admin, password: Admin@1234)');
}
