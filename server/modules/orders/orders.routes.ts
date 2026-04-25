import { Router } from 'express';
import * as ctrl from './orders.controller';
import { validate, createOrderSchema, createCustomerSchema, paginationSchema } from '../../utils/validators';
import { requirePermission } from '../../middlewares/auth';
import { auditLog } from '../../middlewares/auditLog';

const router = Router();

// Customers
router.get('/customers', requirePermission('customer.view'), ctrl.listCustomers);
router.get('/customers/:id', requirePermission('customer.view'), ctrl.getCustomer);
router.post('/customers', requirePermission('customer.create'), validate(createCustomerSchema), auditLog('CREATE', 'customers'), ctrl.createCustomer);
router.patch('/customers/:id', requirePermission('customer.update'), auditLog('UPDATE', 'customers'), ctrl.updateCustomer);

// Orders
router.get('/', requirePermission('order.view'), ctrl.listOrders);
router.get('/stats', requirePermission('order.view'), ctrl.getOrderStats);
router.get('/:id', requirePermission('order.view'), ctrl.getOrder);
router.post('/', requirePermission('order.create'), validate(createOrderSchema), auditLog('CREATE', 'orders'), ctrl.createOrder);
router.patch('/:id/status', requirePermission('order.update'), auditLog('UPDATE', 'orders'), ctrl.updateOrderStatus);

export default router;
