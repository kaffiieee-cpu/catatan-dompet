import {
  BillPaymentRecord,
  DebtRecord,
  PeriodFilter,
  Transaction,
  Wallet,
} from '../types/finance';
import { getMonthShortLabel, pad2 } from './format';

export function computeWalletBalance(wallet: Wallet, transactions: Transaction[]): number {
  let txDelta = 0;
  for (const tx of transactions) {
    if (tx.type === 'income' && tx.walletId === wallet.id) {
      txDelta += tx.amount;
    } else if (tx.type === 'expense' && tx.walletId === wallet.id) {
      txDelta -= tx.amount;
    } else if (tx.type === 'transfer') {
      if (tx.walletId === wallet.id) {
        txDelta -= tx.amount;
      }
      if (tx.targetWalletId === wallet.id) {
        txDelta += tx.amount;
      }
    }
  }
  return wallet.initialBalance + wallet.historicalAdjustment + txDelta;
}

export function computeAllWalletBalances(
  wallets: Wallet[],
  transactions: Transaction[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const w of wallets) {
    map[w.id] = w.initialBalance + w.historicalAdjustment;
  }
  for (const tx of transactions) {
    if (tx.type === 'income' && map[tx.walletId] !== undefined) {
      map[tx.walletId] += tx.amount;
    } else if (tx.type === 'expense' && map[tx.walletId] !== undefined) {
      map[tx.walletId] -= tx.amount;
    } else if (tx.type === 'transfer') {
      if (map[tx.walletId] !== undefined) {
        map[tx.walletId] -= tx.amount;
      }
      if (tx.targetWalletId && map[tx.targetWalletId] !== undefined) {
        map[tx.targetWalletId] += tx.amount;
      }
    }
  }
  return map;
}

export function computeNetWorthSummary(
  wallets: Wallet[],
  balances: Record<string, number>,
  debts: DebtRecord[],
) {
  let totalLiquid = 0;
  let totalInvestment = 0;
  for (const w of wallets) {
    const bal = balances[w.id] ?? 0;
    if (w.type === 'investment') {
      totalInvestment += bal;
    } else {
      totalLiquid += bal;
    }
  }
  const totalActiveDebt = debts
    .filter((d) => d.status === 'unpaid' && d.remainingAmount > 0)
    .reduce((acc, d) => acc + d.remainingAmount, 0);

  return {
    totalLiquid,
    totalInvestment,
    totalActiveDebt,
    netPosition: totalLiquid + totalInvestment - totalActiveDebt,
  };
}

export function getBillPaymentForMonth(
  billId: string,
  monthKey: string,
  billPayments: BillPaymentRecord[],
): BillPaymentRecord | undefined {
  return billPayments.find((p) => p.billId === billId && p.monthKey === monthKey);
}

export function getPeriodRange(period: PeriodFilter, now: Date = new Date()): {
  startIso: string;
  endIso: string;
  monthsCount: number;
} {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthsCount = period === '1m' ? 1 : period === '6m' ? 6 : 12;
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);

  const startIso = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;
  const endIso = `${end.getFullYear()}-${pad2(end.getMonth() + 1)}-${pad2(end.getDate())}`;
  return { startIso, endIso, monthsCount };
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: PeriodFilter,
  now: Date = new Date(),
): Transaction[] {
  const { startIso, endIso } = getPeriodRange(period, now);
  return transactions.filter((tx) => tx.date >= startIso && tx.date <= endIso);
}

export function filterDebtsByPeriod(
  debts: DebtRecord[],
  period: PeriodFilter,
  now: Date = new Date(),
): DebtRecord[] {
  const { startIso, endIso } = getPeriodRange(period, now);
  return debts.filter((d) => d.date >= startIso && d.date <= endIso);
}

export interface CashflowChartPoint {
  label: string;
  pemasukan: number;
  pengeluaran: number;
}

export function buildCashflowChartData(
  transactions: Transaction[],
  period: PeriodFilter,
  now: Date = new Date(),
): CashflowChartPoint[] {
  if (period === '1m') {
    const monthKey = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
    const buckets: CashflowChartPoint[] = [
      { label: 'Tgl 1-7', pemasukan: 0, pengeluaran: 0 },
      { label: 'Tgl 8-14', pemasukan: 0, pengeluaran: 0 },
      { label: 'Tgl 15-21', pemasukan: 0, pengeluaran: 0 },
      { label: 'Tgl 22-31', pemasukan: 0, pengeluaran: 0 },
    ];
    for (const tx of transactions) {
      if (!tx.date.startsWith(monthKey)) continue;
      const day = Number(tx.date.slice(8, 10)) || 1;
      const idx = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3;
      if (tx.type === 'income') buckets[idx].pemasukan += tx.amount;
      if (tx.type === 'expense') buckets[idx].pengeluaran += tx.amount;
    }
    return buckets;
  }

  const count = period === '6m' ? 6 : 12;
  const points: Array<CashflowChartPoint & { key: string }> = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    const label = `${getMonthShortLabel(d.getMonth())}${count === 12 ? '' : ` ${String(d.getFullYear()).slice(2)}`}`;
    points.push({ key, label, pemasukan: 0, pengeluaran: 0 });
  }

  const lookup = new Map(points.map((p) => [p.key, p]));
  for (const tx of transactions) {
    const key = tx.date.slice(0, 7);
    const bucket = lookup.get(key);
    if (!bucket) continue;
    if (tx.type === 'income') bucket.pemasukan += tx.amount;
    if (tx.type === 'expense') bucket.pengeluaran += tx.amount;
  }

  return points.map(({ label, pemasukan, pengeluaran }) => ({
    label,
    pemasukan,
    pengeluaran,
  }));
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  isAllocation: boolean;
}

export function buildExpenseCategoryBreakdown(
  transactions: Transaction[],
  wallets: Wallet[],
): CategoryBreakdownItem[] {
  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const totals = new Map<string, { amount: number; isAllocation: boolean }>();

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      const prev = totals.get(tx.category) ?? { amount: 0, isAllocation: false };
      prev.amount += tx.amount;
      totals.set(tx.category, prev);
    } else if (tx.type === 'transfer' && tx.targetWalletId) {
      const target = walletMap.get(tx.targetWalletId);
      const source = walletMap.get(tx.walletId);
      if (target?.type === 'investment' && source?.type !== 'investment') {
        const key = `Alokasi: ${target.name}`;
        const prev = totals.get(key) ?? { amount: 0, isAllocation: true };
        prev.amount += tx.amount;
        totals.set(key, prev);
      }
    }
  }

  const grandTotal = Array.from(totals.values()).reduce((sum, item) => sum + item.amount, 0);
  if (grandTotal <= 0) return [];

  return Array.from(totals.entries())
    .map(([category, info]) => ({
      category,
      amount: info.amount,
      percentage: Math.round((info.amount / grandTotal) * 100),
      isAllocation: info.isAllocation,
    }))
    .sort((a, b) => b.amount - a.amount);
}
