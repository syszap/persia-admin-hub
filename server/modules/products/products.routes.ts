import { Router } from 'express';
import * as ctrl from './products.controller';
import { validate, createProductSchema, createCategorySchema, paginationSchema } from '../../utils/validators';
import { requirePermission } from '../../middlewares/auth';
import { auditLog } from '../../middlewares/auditLog';

const router = Router();

// Categories
router.get('/categories', requirePermission('product.view'), ctrl.listCategories);
router.post('/categories', requirePermission('product.create'), validate(createCategorySchema), ctrl.createCategory);

// Products
router.get('/', requirePermission('product.view'), ctrl.listProducts);
router.get('/low-stock', requirePermission('product.view'), ctrl.getLowStock);
router.get('/:id', requirePermission('product.view'), ctrl.getProduct);
router.post('/', requirePermission('product.create'), validate(createProductSchema), auditLog('CREATE', 'products'), ctrl.createProduct);
router.patch('/:id', requirePermission('product.update'), auditLog('UPDATE', 'products'), ctrl.updateProduct);
router.delete('/:id', requirePermission('product.delete'), auditLog('DELETE', 'products'), ctrl.deleteProduct);

// Inventory
router.post('/inventory/movement', requirePermission('product.update'), ctrl.addInventoryMovement);

export default router;
