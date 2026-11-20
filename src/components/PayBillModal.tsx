import React, { useEffect, useState } from 'react';
import { HandCoins, Wallet as WalletIcon } from 'lucide-react';
import { BillFundingType, MandatoryBill, Wallet } from '../types/finance';
import { formatMonthYearId, formatRupiah, getCurrentMonthKey } from '../utils/format';
import { CurrencyInput } from './CurrencyInput';
import { ModalSheet } from './ModalSheet';

interface PayBillModalProps {
  bill: MandatoryBill | null;
  wallets: Wallet[];
  balances: Record<string, number>;
  onClose: () => void;
  onConfirm: (payload: {
    bill: MandatoryBill;
    amount: number;
    fundingType: BillFundingType;
    walletId?: string;
    lenderName?: string;
  }) => void;
}

export const PayBillModal: React.FC<PayBillModalProps> = ({
  bill,
  wallets,
  balances,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState(0);
  const [fundingType, setFundingType] = useState<BillFundingType>('wallet');
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '');
  const [lenderName, setLenderName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bill) return;
    setAmount(bill.amount);
    setFundingType('wallet');
    setWalletId(wallets.find((w) => w.type === 'bank')?.id ?? wallets[0]?.id ?? '');
    setLenderName('');
    setError('');
  }, [bill, wallets]);

  if (!bill) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Nominal pembayaran harus lebih dari Rp 0.');
      return;
    }
    if (fundingType === 'wallet' && !walletId) {
      setError('Pilih dompet sumber dana.');
      return;
    }
    if (fundingType === 'debt' && !lenderName.trim()) {
      setError('Masukkan nama pemberi pinjaman (Pinjam ke siapa).');
      return;
    }

    onConfirm({
      bill,
      amount,
      fundingType,
      walletId: fundingType === 'wallet' ? walletId : undefined,
      lenderName: fundingType === 'debt' ? lenderName.trim() : undefined,
    });
    onClose();
  };

  return (
    <ModalSheet
      open={Boolean(bill)}
      onClose={onClose}
      title={`Bayar: ${bill.name}`}
      subtitle={`Periode ${formatMonthYearId(getCurrentMonthKey())} • Jatuh tempo tgl ${bill.dueDay}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Nominal Aktual Bulan Ini
          </label>
          <CurrencyInput value={amount} onChange={setAmount} required />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Anda bisa menyesuaikan nominal jika tagihan bulan ini berbeda dari estimasi rutin.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Sumber Pembayaran
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setFundingType('wallet');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition ${
                fundingType === 'wallet'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'border-sandline dark:border-slateborder text-slate-600 dark:text-slate-300'
              }`}
            >
              <WalletIcon className="w-4 h-4" />
              <span>Dompet / Buku</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFundingType('debt');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition ${
                fundingType === 'debt'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  : 'border-sandline dark:border-slateborder text-slate-600 dark:text-slate-300'
              }`}
            >
              <HandCoins className="w-4 h-4" />
              <span>Pakai Utang / Pinjam</span>
            </button>
          </div>
        </div>

        {fundingType === 'wallet' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Pilih Dompet / Buku Sumber
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
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <label className="block text-xs font-bold text-amber-900 dark:text-amber-200">
              Pinjam ke siapa (Nama)
            </label>
            <input
              type="text"
              value={lenderName}
              onChange={(e) => setLenderName(e.target.value)}
              placeholder="Contoh: Mas Budi, Orang Tua, Koperasi"
              required
              className="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-obsidian px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-[11px] text-amber-800 dark:text-amber-300/90">
              Pembayaran ini otomatis dicatat ke daftar Catatan Utang aktif.
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-sm transition"
        >
          Konfirmasi Bayar ({formatRupiah(amount)})
        </button>
      </form>
    </ModalSheet>
  );
};
