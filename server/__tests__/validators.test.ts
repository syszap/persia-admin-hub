import { createTransactionSchema, loginSchema, createUserSchema } from '../utils/validators';

describe('Validators', () => {
  describe('loginSchema', () => {
    it('accepts valid credentials', () => {
      const result = loginSchema.safeParse({ username: 'admin', password: 'Admin@1234' });
      expect(result.success).toBe(true);
    });

    it('rejects empty username', () => {
      const result = loginSchema.safeParse({ username: '', password: 'pass' });
      expect(result.success).toBe(false);
    });
  });

  describe('createTransactionSchema', () => {
    it('accepts balanced transaction', () => {
      const result = createTransactionSchema.safeParse({
        date: '2024-01-15',
        description: 'Test transaction',
        entries: [
          { accountId: '550e8400-e29b-41d4-a716-446655440000', entryType: 'debit', amount: 1000 },
          { accountId: '550e8400-e29b-41d4-a716-446655440001', entryType: 'credit', amount: 1000 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects unbalanced transaction', () => {
      const result = createTransactionSchema.safeParse({
        date: '2024-01-15',
        description: 'Test',
        entries: [
          { accountId: '550e8400-e29b-41d4-a716-446655440000', entryType: 'debit', amount: 1000 },
          { accountId: '550e8400-e29b-41d4-a716-446655440001', entryType: 'credit', amount: 900 },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid date format', () => {
      const result = createTransactionSchema.safeParse({
        date: '15/01/2024',
        description: 'Test',
        entries: [
          { accountId: '550e8400-e29b-41d4-a716-446655440000', entryType: 'debit', amount: 100 },
          { accountId: '550e8400-e29b-41d4-a716-446655440001', entryType: 'credit', amount: 100 },
        ],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    it('accepts valid user', () => {
      const result = createUserSchema.safeParse({
        username: 'testuser',
        password: 'SecurePass@1',
        role: 'user',
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short password', () => {
      const result = createUserSchema.safeParse({ username: 'user', password: '123', role: 'user' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid role', () => {
      const result = createUserSchema.safeParse({ username: 'user', password: 'password123', role: 'superadmin' });
      expect(result.success).toBe(false);
    });
  });
});
