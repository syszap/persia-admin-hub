import { describe, it, expect } from 'vitest';
import { ROLE_WEIGHT, ROLE_PERMISSIONS } from '@/features/auth/types/auth.types';

describe('Auth types', () => {
  it('ROLE_WEIGHT is ordered correctly', () => {
    expect(ROLE_WEIGHT.owner).toBeGreaterThan(ROLE_WEIGHT.admin);
    expect(ROLE_WEIGHT.admin).toBeGreaterThan(ROLE_WEIGHT.finance_manager);
    expect(ROLE_WEIGHT.finance_manager).toBeGreaterThan(ROLE_WEIGHT.user);
    expect(ROLE_WEIGHT.user).toBeGreaterThan(ROLE_WEIGHT.customer);
  });

  it('owner has all permissions', () => {
    expect(ROLE_PERMISSIONS.owner).toContain('user.delete');
    expect(ROLE_PERMISSIONS.owner).toContain('financial.approve');
    expect(ROLE_PERMISSIONS.owner).toContain('audit.view');
  });

  it('customer only has read-only permissions', () => {
    expect(ROLE_PERMISSIONS.customer).toContain('product.view');
    expect(ROLE_PERMISSIONS.customer).not.toContain('user.create');
  });
});

describe('Financial double-entry', () => {
  function isBalanced(entries: Array<{ type: 'debit' | 'credit'; amount: number }>) {
    const debit = entries.filter(e => e.type === 'debit').reduce((s, e) => s + e.amount, 0);
    const credit = entries.filter(e => e.type === 'credit').reduce((s, e) => s + e.amount, 0);
    return Math.abs(debit - credit) < 0.01;
  }

  it('balanced entries pass', () => {
    expect(isBalanced([{ type: 'debit', amount: 500 }, { type: 'credit', amount: 500 }])).toBe(true);
  });

  it('unbalanced entries fail', () => {
    expect(isBalanced([{ type: 'debit', amount: 500 }, { type: 'credit', amount: 400 }])).toBe(false);
  });
});
