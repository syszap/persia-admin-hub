export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type TransactionStatus = 'draft' | 'posted' | 'void';
export type EntryType = 'debit' | 'credit';

export interface Account {
  id: string;
  code: string;
  name: string;
  nameFa: string;
  type: AccountType;
  parentId?: string;
  isActive: boolean;
  balance: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionEntry {
  id: string;
  transactionId: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  entryType: EntryType;
  amount: number;
  description?: string;
}

export interface Transaction {
  id: string;
  referenceNumber: string;
  date: string;
  description: string;
  status: TransactionStatus;
  totalAmount: number;
  entries: TransactionEntry[];
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  payerId: string;
  payerName: string;
  accountId: string;
  accountName?: string;
  amount: number;
  description?: string;
  referenceNumber?: string;
  transactionId?: string;
  createdBy: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  date: string;
  payeeId: string;
  payeeName: string;
  accountId: string;
  accountName?: string;
  amount: number;
  description?: string;
  referenceNumber?: string;
  transactionId?: string;
  createdBy: string;
  createdAt: string;
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
