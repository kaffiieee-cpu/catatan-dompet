import React from 'react';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Trash2 } from 'lucide-react';
import { Transaction, Wallet } from '../types/finance';
import { formatDateId, formatRupiah } from '../utils/format';
import { ModalSheet } from './ModalSheet';
import { WALLET_TYPE_LABELS } from './WalletTheme';

interface WalletHistoryModalProps {
  wallet: Wallet | null;
  balance: number;
  wallets: Wallet[];
  transactions: Transaction[];
  onClose: () => void;
  onDeleteTransaction: (txId: string) => void;
}

export const WalletHistoryModal: React.FC<WalletHistoryModalProps> = ({
  wallet,
  balance,
  wallets,
  transactions,
  onClose,
  onDeleteTransaction,
}) => {
  if (!wallet) return null;

  const walletMap = new Map(wallets.map((w) => [w.id, w.name]));
  const relatedTx = transactions
    .filter((tx) => tx.walletId === wallet.id || tx.targetWalletId === wallet.id)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)));

  return (
    <ModalSheet
      open={Boolean(wallet)}
      onClose={onClose}
      title={wallet.name}
      subtitle={`${WALLET_TYPE_LABELS[wallet.type]}${wallet.note ? ` • ${wallet.note}` : ''}`}
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-alabaster dark:bg-obsidian border border-sandline dark:border-slateborder p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Saldo Buku Saat Ini
          </p>
          <p className="text-2xl font-extrabold num-tabular text-slate-900 dark:text-white mt-0.5">
            {formatRupiah(balance)}
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-sandline dark:border-slateborder flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Saldo Awal: <strong className="num-tabular">{formatRupiah(wallet.initialBalance)}</strong>
            </span>
            {wallet.historicalAdjustment !== 0 && (
              <span>
                Penyesuaian Historis 5 Thn:{' '}
                <strong className="num-tabular">
                  {formatRupiah(wallet.historicalAdjustment, true)}
                </strong>
              </span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Riwayat Mutasi ({relatedTx.length})
          </h4>
          {relatedTx.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
              Belum ada transaksi pada buku ini.
            </p>
          ) : (
            <div className="divide-y divide-sandline dark:divide-slateborder">
              {relatedTx.map((tx) => {
                const isIncomingTransfer =
                  tx.type === 'transfer' && tx.targetWalletId === wallet.id;
                const isPositive = tx.type === 'income' || isIncomingTransfer;
                const counterpartName =
                  tx.type === 'transfer'
                    ? isIncomingTransfer
                      ? `Dari ${walletMap.get(tx.walletId) ?? 'Dompet'}`
                      : `Ke ${walletMap.get(tx.targetWalletId ?? '') ?? 'Dompet'}`
                    : tx.category;

                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                          tx.type === 'transfer'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : isPositive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {tx.type === 'transfer' ? (
                          <ArrowLeftRight className="w-4 h-4" />
                        ) : isPositive ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {counterpartName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {formatDateId(tx.date)}
                          {tx.note ? ` • ${tx.note}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-sm font-bold num-tabular ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatRupiah(isPositive ? tx.amount : -tx.amount, true)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(tx.id)}
                        aria-label="Hapus transaksi"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ModalSheet>
  );
};
