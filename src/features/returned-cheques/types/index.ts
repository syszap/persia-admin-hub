export interface ReturnedCheque {
  VoucherRef: number;
  VoucherNumber: string;
  elamiye: string | null;
  BankName: string | null;
  ChequeNumber: string | null;
  DueDate: string | null;
  VoucherDate: string | null;
  DLLevel4: string | null;
  DLTitle_Level4: string | null;
  DLLevel5: string | null;
  DLTitle_Level5: string | null;
  Debit: number;
  TotalBalance: number;
  CustomerBalance: number | null;
  FollowUpNumber: string | null;
  Description: string | null;
}

export interface ChequesResponse {
  data: ReturnedCheque[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SummaryAlert {
  type: 'high-risk';
  message: string;
}

export interface ChequesSummary {
  totalCount: number;
  totalAmount: number;
  overdueCount: number;
  overdueAmount: number;
  alerts: SummaryAlert[];
}

export interface CustomerRow {
  customerName: string;
  totalCheques: number;
  totalAmount: number;
  overdueCount: number;
  overdueAmount: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface ChequesFilters {
  search: string;
  fromDate: string;
  toDate: string;
}
