describe('Financial double-entry validation', () => {
  function validateBalance(entries: Array<{ entryType: 'debit' | 'credit'; amount: number }>) {
    const debit = entries.filter(e => e.entryType === 'debit').reduce((s, e) => s + e.amount, 0);
    const credit = entries.filter(e => e.entryType === 'credit').reduce((s, e) => s + e.amount, 0);
    return Math.abs(debit - credit) < 0.01;
  }

  it('balanced transaction passes validation', () => {
    const entries = [
      { entryType: 'debit' as const, amount: 1000 },
      { entryType: 'credit' as const, amount: 1000 },
    ];
    expect(validateBalance(entries)).toBe(true);
  });

  it('unbalanced transaction fails validation', () => {
    const entries = [
      { entryType: 'debit' as const, amount: 1000 },
      { entryType: 'credit' as const, amount: 900 },
    ];
    expect(validateBalance(entries)).toBe(false);
  });

  it('multi-entry balanced transaction passes', () => {
    const entries = [
      { entryType: 'debit' as const, amount: 5000 },
      { entryType: 'credit' as const, amount: 3000 },
      { entryType: 'credit' as const, amount: 2000 },
    ];
    expect(validateBalance(entries)).toBe(true);
  });
});
