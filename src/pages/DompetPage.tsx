import React from 'react';
import {
  Banknote,
  Building2,
  CheckCircle2,
  HandCoins,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  WALLET_ACCENT_STYLES,
  WALLET_TYPE_LABELS,
} from '../components/WalletTheme';
import { DebtRecord, Wallet, WalletType } from '../types/finance';
import { formatDateId, formatRupiah } from '../utils/format';

interface DompetPageProps {
  wallets: Wallet[];
  balances: Record<string, number>;
  debts: DebtRecord[];
  onAddWallet: () => void;
  onEditWallet: (wallet: Wallet) => void;
  onDeleteWallet: (walletId: string) => void;
  onSelectWalletHistory: (wallet: Wallet) => void;
  onAddDebt: () => void;
  onEditDebt: (debt: DebtRecord) => void;
  onDeleteDebt: (debtId: string) => void;
  onPayDebt: (debt: DebtRecord) => void;
}

const GROUPS: Array<{
  type: WalletType;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { type: 'cash', icon: Banknote },
  { type: 'bank', icon: Building2 },
  { type: 'investment', icon: TrendingUp },
];

export const DompetPage: React.FC<DompetPageProps> = ({
  wallets,
  balances,
  debts,
  onAddWallet,
  onEditWallet,
  onDeleteWallet,
  onSelectWalletHistory,
  onAddDebt,
  onEditDebt,
  onDeleteDebt,
  onPayDebt,
}) => {
  const sortedDebts = [...debts].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'unpaid' ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  const totalActiveDebt = debts
    .filter((d) => d.status === 'unpaid')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header Dompet & Buku Aset */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Dompet & Buku Aset
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ketuk kartu untuk melihat riwayat mutasi buku
          </p>
        </div>
        <button
          type="button"
          onClick={onAddWallet}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Dompet</span>
        </button>
      </div>

      {/* 3 Kelompok Dompet */}
      <div className="space-y-5">
        {GROUPS.map(({ type, icon: Icon }) => {
          const groupWallets = wallets.filter((w) => w.type === type);
          const groupTotal = groupWallets.reduce(
            (sum, w) => sum + (balances[w.id] ?? 0),
            0,
          );

          return (
            <section key={type} className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{WALLET_TYPE_LABELS[type]}</span>
                </div>
                <span className="text-xs font-extrabold num-tabular text-slate-700 dark:text-slate-200">
                  {formatRupiah(groupTotal)}
                </span>
              </div>

              {groupWallets.length === 0 ? (
                <div className="bento-card p-4 text-xs text-slate-500 dark:text-slate-400">
                  Belum ada buku di kategori {WALLET_TYPE_LABELS[type]}.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupWallets.map((wallet) => {
                    const style = WALLET_ACCENT_STYLES[wallet.accent] ?? WALLET_ACCENT_STYLES.slate;
                    const bal = balances[wallet.id] ?? 0;

                    return (
                      <div
                        key={wallet.id}
                        onClick={() => onSelectWalletHistory(wallet)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectWalletHistory(wallet);
                          }
                        }}
                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.cardBg} p-4 shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition`}
                      >
                        <div className={`absolute inset-0 ${style.pattern} opacity-45 pointer-events-none`} />
                        <div className="relative z-10 flex flex-col justify-between min-h-[112px]">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span
                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badgeBg}`}
                              >
                                {WALLET_TYPE_LABELS[wallet.type]}
                              </span>
                              <h3 className="text-base font-extrabold mt-1.5 truncate">
                                {wallet.name}
                              </h3>
                            </div>

                            <div
                              className="flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => onEditWallet(wallet)}
                                aria-label="Ubah dompet"
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteWallet(wallet.id)}
                                aria-label="Hapus dompet"
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/80 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-xl font-extrabold num-tabular tracking-tight">
                              {formatRupiah(bal)}
                            </p>
                            {wallet.note && (
                              <p className="text-[11px] text-white/80 truncate mt-0.5">
                                {wallet.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Catatan Utang / Pinjaman */}
      <section className="space-y-3 pt-2 border-t border-sandline dark:border-slateborder">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <HandCoins className="w-4 h-4 text-rose-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Catatan Utang / Pinjaman
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total sisa utang aktif:{' '}
              <strong className="num-tabular text-rose-600 dark:text-rose-400">
                {formatRupiah(totalActiveDebt)}
              </strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onAddDebt}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Utang</span>
          </button>
        </div>

        {sortedDebts.length === 0 ? (
          <div className="bento-card p-6 text-center space-y-1">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Bebas Utang!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Belum ada catatan utang atau pinjaman yang tersimpan.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedDebts.map((debt) => {
              const isPaid = debt.status === 'paid' || debt.remainingAmount <= 0;
              const paidAmount = Math.max(0, debt.initialAmount - debt.remainingAmount);
              const pct =
                debt.initialAmount > 0
                  ? Math.min(100, Math.round((paidAmount / debt.initialAmount) * 100))
                  : 100;

              return (
                <div key={debt.id} className="bento-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {debt.lenderName}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {isPaid ? 'Lunas' : 'Belum Lunas'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tanggal: {formatDateId(debt.date)}
                        {debt.note ? ` • ${debt.note}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditDebt(debt)}
                        aria-label="Ubah utang"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDebt(debt.id)}
                        aria-label="Hapus utang"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Total Pinjaman:{' '}
                        <strong className="num-tabular text-slate-700 dark:text-slate-200">
                          {formatRupiah(debt.initialAmount)}
                        </strong>
                      </span>
                      <span
                        className={`font-extrabold num-tabular ${
                          isPaid
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isPaid ? 'Lunas' : `Sisa ${formatRupiah(debt.remainingAmount)}`}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isPaid ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {!isPaid ? (
                    <button
                      type="button"
                      onClick={() => onPayDebt(debt)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition"
                    >
                      Bayar / Cicil Utang
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Utang telah lunas dibayar</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
