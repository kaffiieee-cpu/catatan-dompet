export type WalletType = 'cash' | 'bank' | 'investment';

export type WalletAccent = 'emerald' | 'blue' | 'amber' | 'violet' | 'rose' | 'slate';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  initialBalance: number;
  historicalAdjustment: number;
  accent: WalletAccent;
  note?: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  walletId: string;
  targetWalletId?: string;
  date: string; // YYYY-MM-DD
  note?: string;
  relatedBillId?: string;
  relatedDebtId?: string;
  createdAt: string;
}

export interface MandatoryBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 - 31
  category: string;
  note?: string;
  createdAt: string;
}

export type BillFundingType = 'wallet' | 'debt';

export interface BillPaymentRecord {
  id: string;
  billId: string;
  monthKey: string; // YYYY-MM
  amount: number;
  paidAt: string; // YYYY-MM-DD
  fundingType: BillFundingType;
  walletId?: string;
  debtId?: string;
  lenderName?: string;
  transactionId?: string;
}

export type DebtStatus = 'unpaid' | 'paid';

export interface DebtPayment {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  walletId: string;
  transactionId?: string;
}

export interface DebtRecord {
  id: string;
  lenderName: string;
  initialAmount: number;
  remainingAmount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  status: DebtStatus;
  relatedBillId?: string;
  payments: DebtPayment[];
  createdAt: string;
}

export type AppTheme = 'light' | 'dark';

export type PeriodFilter = '1m' | '6m' | '1y';

export type AppTab = 'beranda' | 'wajib' | 'dompet' | 'cashflow' | 'setelan';

export interface AppState {
  schemaVersion: number;
  theme: AppTheme;
  wallets: Wallet[];
  transactions: Transaction[];
  bills: MandatoryBill[];
  billPayments: BillPaymentRecord[];
  debts: DebtRecord[];
  lastPrunedAt: string | null;
  lastPrunedCount: number;
}

export const INCOME_CATEGORIES = [
  'Gaji',
  'Bisnis',
  'Profit Trading',
  'Bonus',
  'Lainnya',
] as const;

export const EXPENSE_CATEGORIES = [
  'Tagihan Wajib',
  'Makan',
  'Jajan',
  'Bensin',
  'Operasional',
  'Hiburan',
  'Bayar Utang',
  'Lainnya',
] as const;

export const BILL_CATEGORIES = [
  'Utilitas',
  'Operasional',
  'Langganan',
  'Cicilan',
  'Keluarga',
  'Lainnya',
] as const;
