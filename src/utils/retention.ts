import { AppState, Transaction, Wallet } from '../types/finance';
import { pad2 } from './format';

export interface RetentionResult {
  state: AppState;
  prunedCount: number;
  cutoffDate: string;
}

/**
 * Menghitung batas retensi 5 tahun kalender penuh.
 * Transaksi dengan tanggal lebih tua dari (hari ini - 5 tahun),
 * yakni mulai hari ke (5 tahun + 1 hari), akan dipangkas otomatis.
 */
export function getFiveYearCutoffIso(now: Date = new Date()): string {
  const cutoff = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  return `${cutoff.getFullYear()}-${pad2(cutoff.getMonth() + 1)}-${pad2(cutoff.getDate())}`;
}

/**
 * Memangkas transaksi yang lebih tua dari 5 tahun (+1 hari) TANPA merusak saldo dompet.
 * Selisih bersih (net delta) dari transaksi kadaluarsa dilipat permanen ke `historicalAdjustment`
 * pada masing-masing dompet sebelum transaksi dihapus.
 * Rumus saldo dompet: initialBalance + historicalAdjustment + sum(active transactions).
 */
export function runFiveYearRetentionPrune(
  state: AppState,
  now: Date = new Date(),
): RetentionResult {
  const cutoffDate = getFiveYearCutoffIso(now);

  const expired: Transaction[] = [];
  const active: Transaction[] = [];

  for (const tx of state.transactions) {
    if (tx.date < cutoffDate) {
      expired.push(tx);
    } else {
      active.push(tx);
    }
  }

  if (expired.length === 0) {
    return {
      state: {
        ...state,
        lastPrunedAt: now.toISOString(),
        lastPrunedCount: 0,
      },
      prunedCount: 0,
      cutoffDate,
    };
  }

  const walletDelta = new Map<string, number>();

  for (const tx of expired) {
    if (tx.type === 'income') {
      walletDelta.set(tx.walletId, (walletDelta.get(tx.walletId) ?? 0) + tx.amount);
    } else if (tx.type === 'expense') {
      walletDelta.set(tx.walletId, (walletDelta.get(tx.walletId) ?? 0) - tx.amount);
    } else if (tx.type === 'transfer') {
      walletDelta.set(tx.walletId, (walletDelta.get(tx.walletId) ?? 0) - tx.amount);
      if (tx.targetWalletId) {
        walletDelta.set(
          tx.targetWalletId,
          (walletDelta.get(tx.targetWalletId) ?? 0) + tx.amount,
        );
      }
    }
  }

  const updatedWallets: Wallet[] = state.wallets.map((w) => {
    const delta = walletDelta.get(w.id) ?? 0;
    if (delta === 0) return w;
    return {
      ...w,
      historicalAdjustment: w.historicalAdjustment + delta,
    };
  });

  // Juga bersihkan catatan pembayaran tagihan yang lebih tua dari 5 tahun
  const cutoffMonthKey = cutoffDate.slice(0, 7);
  const activeBillPayments = state.billPayments.filter(
    (p) => p.monthKey >= cutoffMonthKey,
  );

  return {
    state: {
      ...state,
      wallets: updatedWallets,
      transactions: active,
      billPayments: activeBillPayments,
      lastPrunedAt: now.toISOString(),
      lastPrunedCount: expired.length,
    },
    prunedCount: expired.length,
    cutoffDate,
  };
}
