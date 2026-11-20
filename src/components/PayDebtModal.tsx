import React, { useEffect, useState } from 'react';
import { DebtRecord, Wallet } from '../types/finance';
import { formatRupiah } from '../utils/format';
import { CurrencyInput } from './CurrencyInput';
import { ModalSheet } from './ModalSheet';

interface PayDebtModalProps {
  debt: DebtRecord | null;
  wallets: Wallet[];
  balances: Record<string, number>;
  onClose: () => void;
  onConfirm: (payload: { debt: DebtRecord; amount: number; walletId: string }) => void;
}

export const PayDebtModal: React.FC<PayDebtModalProps> = ({
  debt,
  wallets,
  balances,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState(0);
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!debt) return;
    setAmount(debt.remainingAmount);
    setWalletId(wallets.find((w) => w.type === 'bank')?.id ?? wallets[0]?.id ?? '');
    setError('');
  }, [debt, wallets]);

  if (!debt) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Nominal pembayaran harus lebih dari Rp 0.');
      return;
    }
    if (amount > debt.remainingAmount) {
      setError(
        `Nominal melebihi sisa utang (${formatRupiah(debt.remainingAmount)}).`,
      );
      return;
    }
    if (!walletId) {
      setError('Pilih dompet sumber dana.');
      return;
    }
    onConfirm({ debt, amount, walletId });
    onClose();
  };

  return (
    <ModalSheet
      open={Boolean(debt)}
      onClose={onClose}
      title={`Bayar / Cicil Utang`}
      subtitle={`Kepada ${debt.lenderName} • Sisa ${formatRupiah(debt.remainingAmount)}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Nominal Pembayaran
            </label>
            <button
              type="button"
              onClick={() => setAmount(debt.remainingAmount)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Lunasi Semua
            </button>
          </div>
          <CurrencyInput value={amount} onChange={setAmount} required />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Ambil Dana dari Dompet
          </label>
          <select
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({formatRupiah(balances[w.id] ?? 0)})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition"
        >
          Konfirmasi Bayar ({formatRupiah(amount)})
        </button>
      </form>
    </ModalSheet>
  );
};
