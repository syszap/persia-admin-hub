import { Router } from 'express';
import * as ctrl from './audit.controller';
import { requirePermission } from '../../middlewares/auth';

const router = Router();

router.get('/', requirePermission('audit.view'), ctrl.listAuditLogs);

export default router;
