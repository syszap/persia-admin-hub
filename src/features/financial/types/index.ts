export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type TransactionStatus = 'draft' | 'posted' | 'void';
export type EntryType = 'debit' | 'credit';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: 'دارایی',
  liability: 'بدهی',
  equity: 'حقوق صاحبان سهام',
  revenue: 'درآمد',
  expense: 'هزینه',
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  draft: 'پیش‌نویس',
  posted: 'ثبت شده',
  void: 'باطل',
};

export interface Account {
  id: string;
  code: string;
  name: string;
  name_fa: string;
  type: AccountType;
  parent_id?: string;
  is_active: boolean;
  balance: number;
  description?: string;
  created_at: string;
}

export interface TransactionEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  account_code?: string;
  account_name?: string;
  entry_type: EntryType;
  amount: number;
  description?: string;
}

export interface Transaction {
  id: string;
  reference_number: string;
  date: string;
  description: string;
  status: TransactionStatus;
  total_amount: number;
  entries: TransactionEntry[];
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

export interface LedgerEntry {
  date: string;
  referenceNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}
