import { Router } from 'express';
import * as ctrl from './financial.controller';
import { validate, createAccountSchema, createTransactionSchema, paginationSchema } from '../../utils/validators';
import { requirePermission } from '../../middlewares/auth';
import { auditLog } from '../../middlewares/auditLog';

const router = Router();

// Accounts
router.get('/accounts', requirePermission('account.view'), ctrl.listAccounts);
router.get('/accounts/trial-balance', requirePermission('financial.view'), ctrl.getTrialBalance);
router.get('/accounts/:id', requirePermission('account.view'), ctrl.getAccount);
router.post('/accounts', requirePermission('account.create'), validate(createAccountSchema), auditLog('CREATE', 'accounts'), ctrl.createAccount);
router.patch('/accounts/:id', requirePermission('account.update'), auditLog('UPDATE', 'accounts'), ctrl.updateAccount);

// Ledger
router.get('/accounts/:id/ledger', requirePermission('financial.view'), ctrl.getAccountLedger);

// Transactions (Journal)
router.get('/transactions', requirePermission('financial.view'), ctrl.listTransactions);
router.get('/transactions/:id', requirePermission('financial.view'), ctrl.getTransaction);
router.post('/transactions', requirePermission('financial.create'), validate(createTransactionSchema), auditLog('CREATE', 'transactions'), ctrl.createTransaction);
router.post('/transactions/:id/post', requirePermission('financial.approve'), auditLog('APPROVE', 'transactions'), ctrl.postTransaction);
router.post('/transactions/:id/void', requirePermission('financial.approve'), auditLog('UPDATE', 'transactions'), ctrl.voidTransaction);

export default router;
