import { Router } from 'express';
import * as ctrl from './users.controller';
import { validate, createUserSchema, updateUserSchema, paginationSchema, uuidSchema } from '../../utils/validators';
import { requirePermission } from '../../middlewares/auth';
import { auditLog } from '../../middlewares/auditLog';

const router = Router();

router.get('/', requirePermission('user.view'), validate(paginationSchema, 'query'), ctrl.list);
router.get('/:id', requirePermission('user.view'), ctrl.getById);
router.post('/', requirePermission('user.create'), validate(createUserSchema), auditLog('CREATE', 'users'), ctrl.create);
router.patch('/:id', requirePermission('user.update'), validate(updateUserSchema), auditLog('UPDATE', 'users'), ctrl.update);
router.delete('/:id', requirePermission('user.delete'), auditLog('DELETE', 'users'), ctrl.remove);

export default router;
