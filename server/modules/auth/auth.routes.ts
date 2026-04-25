import { Router } from 'express';
import * as ctrl from './auth.controller';
import { validate, loginSchema, refreshSchema } from '../../utils/validators';
import { authLimiter } from '../../middlewares/rateLimiter';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authMiddleware, ctrl.me);

export default router;
