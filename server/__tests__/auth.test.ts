import { ROLE_PERMISSIONS, ROLE_WEIGHT } from '../../packages/shared/src/types/auth';

describe('Auth RBAC', () => {
  it('owner has all permissions', () => {
    const perms = ROLE_PERMISSIONS['owner'];
    expect(perms).toContain('user.delete');
    expect(perms).toContain('financial.approve');
    expect(perms).toContain('order.approve');
  });

  it('customer has minimal permissions', () => {
    const perms = ROLE_PERMISSIONS['customer'];
    expect(perms).toContain('product.view');
    expect(perms).not.toContain('user.delete');
    expect(perms).not.toContain('financial.approve');
  });

  it('finance_manager has financial permissions', () => {
    const perms = ROLE_PERMISSIONS['finance_manager'];
    expect(perms).toContain('financial.view');
    expect(perms).toContain('cheque.view');
    expect(perms).not.toContain('user.delete');
  });

  it('role weights are correctly ordered', () => {
    expect(ROLE_WEIGHT['owner']).toBeGreaterThan(ROLE_WEIGHT['admin']);
    expect(ROLE_WEIGHT['admin']).toBeGreaterThan(ROLE_WEIGHT['finance_manager']);
    expect(ROLE_WEIGHT['finance_manager']).toBeGreaterThan(ROLE_WEIGHT['user']);
    expect(ROLE_WEIGHT['user']).toBeGreaterThan(ROLE_WEIGHT['customer']);
  });
});
