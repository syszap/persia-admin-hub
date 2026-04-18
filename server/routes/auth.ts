import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pgPool from '../postgres';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: 'نام کاربری و کلمه عبور الزامی است' });
    return;
  }

  try {
    const result = await pgPool.query<{
      id: string;
      username: string;
      password_hash: string;
      role: string;
    }>(
      'SELECT id, username, password_hash, role FROM users WHERE username = $1',
      [username],
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'نام کاربری یا کلمه عبور اشتباه است' });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      res.status(401).json({ error: 'نام کاربری یا کلمه عبور اشتباه است' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET ?? 'changeme',
      { expiresIn: '1d' },
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({ error: 'خطا در ورود به سیستم' });
  }
});

export default router;
