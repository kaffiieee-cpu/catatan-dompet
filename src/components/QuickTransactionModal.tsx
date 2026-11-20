import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Transaction,
  TransactionType,
  Wallet,
} from '../types/finance';
import { formatRupiah, getTodayIso } from '../utils/format';
import { CurrencyInput } from './CurrencyInput';
import { ModalSheet } from './ModalSheet';

interface QuickTransactionModalProps {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  balances: Record<string, number>;
  onSubmit: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  open,
  onClose,
  wallets,
  balances,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[1]);
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '');
  const [targetWalletId, setTargetWalletId] = useState(wallets[1]?.id ?? wallets[0]?.id ?? '');
  const [date, setDate] = useState(getTodayIso());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setAmount(0);
    setDate(getTodayIso());
    setNote('');
    setError('');
    if (wallets.length > 0 && !wallets.some((w) => w.id === walletId)) {
      setWalletId(wallets[0].id);
    }
    if (wallets.length > 1 && (!targetWalletId || targetWalletId === walletId)) {
      const other = wallets.find((w) => w.id !== (wallets[0]?.id ?? ''));
      if (other) setTargetWalletId(other.id);
    }
  }, [open, wallets]);

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    setError('');
    if (nextType === 'income') {
      setCategory(INCOME_CATEGORIES[0]);
    } else if (nextType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[1]);
    } else {
      setCategory('Alokasi / Pindah Buku');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Nominal transaksi harus lebih dari Rp 0.');
      return;
    }
    if (!walletId) {
      setError('Pilih dompet terlebih dahulu.');
      return;
    }
    if (type === 'transfer') {
      if (!targetWalletId || targetWalletId === walletId) {
        setError('Dompet tujuan harus berbeda dengan dompet asal.');
        return;
      }
    }

    onSubmit({
      type,
      amount,
      category: type === 'transfer' ? 'Alokasi / Pindah Buku' : category,
      walletId,
      targetWalletId: type === 'transfer' ? targetWalletId : undefined,
      date,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title="Catat Transaksi"
      subtitle="Pemasukan, pengeluaran, atau alokasi pindah buku"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-alabaster dark:bg-obsidian border border-sandline dark:border-slateborder">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Pemasukan</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('transfer')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
              type === 'transfer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Pindah Buku</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Nominal
          </label>
          <CurrencyInput value={amount} onChange={setAmount} autoFocus required />
        </div>

        {type !== 'transfer' && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {type === 'income' ? 'Sumber Pemasukan' : 'Kategori Pengeluaran'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    category === cat
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-500'
                      : 'bg-white dark:bg-obsidian border-sandline dark:border-slateborder text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={type === 'transfer' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : ''}>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {type === 'income'
                ? 'Masuk ke Dompet'
                : type === 'transfer'
                  ? 'Dari Dompet / Buku'
                  : 'Sumber Dana'}
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

          {type === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Ke Dompet / Buku Tujuan
              </label>
              <select
                value={targetWalletId}
                onChange={(e) => setTargetWalletId(e.target.value)}
                className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(balances[w.id] ?? 0)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                type === 'transfer'
                  ? 'Misal: DCA BTC / Depo Exness'
                  : 'Keterangan singkat...'
              }
              className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-sm transition"
        >
          Simpan Transaksi
        </button>
      </form>
    </ModalSheet>
  );
};
