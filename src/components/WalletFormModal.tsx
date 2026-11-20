import React, { useEffect, useState } from 'react';
import { Wallet, WalletAccent, WalletType } from '../types/finance';
import { CurrencyInput } from './CurrencyInput';
import { ModalSheet } from './ModalSheet';
import { WALLET_ACCENT_STYLES, WALLET_TYPE_LABELS } from './WalletTheme';

interface WalletFormModalProps {
  open: boolean;
  editingWallet: Wallet | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    type: WalletType;
    initialBalance: number;
    accent: WalletAccent;
    note?: string;
  }) => void;
}

const ACCENTS: WalletAccent[] = ['emerald', 'blue', 'amber', 'violet', 'rose', 'slate'];
const TYPES: WalletType[] = ['cash', 'bank', 'investment'];

export const WalletFormModal: React.FC<WalletFormModalProps> = ({
  open,
  editingWallet,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [initialBalance, setInitialBalance] = useState(0);
  const [accent, setAccent] = useState<WalletAccent>('blue');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingWallet) {
      setName(editingWallet.name);
      setType(editingWallet.type);
      setInitialBalance(editingWallet.initialBalance);
      setAccent(editingWallet.accent);
      setNote(editingWallet.note ?? '');
    } else {
      setName('');
      setType('bank');
      setInitialBalance(0);
      setAccent('blue');
      setNote('');
    }
    setError('');
  }, [open, editingWallet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama dompet atau buku wajib diisi.');
      return;
    }
    onSave({
      id: editingWallet?.id,
      name: name.trim(),
      type,
      initialBalance,
      accent,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title={editingWallet ? 'Ubah Dompet / Buku' : 'Tambah Dompet / Buku Baru'}
      subtitle="Catat dana tunai, rekening, atau buku investasi & trading"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Jenis Buku
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-2 py-2.5 rounded-xl text-[11px] font-bold border transition ${
                  type === t
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-500'
                    : 'bg-white dark:bg-obsidian border-sandline dark:border-slateborder text-slate-600 dark:text-slate-300'
                }`}
              >
                {WALLET_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Nama Dompet / Buku
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              type === 'investment'
                ? 'Misal: Buku BTC, Buku Saham, Depo Exness'
                : type === 'cash'
                  ? 'Misal: Dompet Tunai, Brankas Rumah'
                  : 'Misal: Bank BCA, Mandiri, GoPay'
            }
            required
            className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Saldo Awal (Rp)
          </label>
          <CurrencyInput value={initialBalance} onChange={setInitialBalance} />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Saldo aktif dihitung otomatis dari saldo awal + penyesuaian historis + semua transaksi.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            {type === 'investment'
              ? 'Catatan Unit / Aset (Opsional)'
              : 'Keterangan Singkat (Opsional)'}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              type === 'investment'
                ? 'Misal: 0.002 BTC, Akun Exness, Lot BBCA'
                : 'Misal: Rekening Gaji & Operasional'
            }
            className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Warna Kartu
          </label>
          <div className="flex items-center gap-2.5">
            {ACCENTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAccent(a)}
                title={WALLET_ACCENT_STYLES[a].label}
                aria-label={WALLET_ACCENT_STYLES[a].label}
                className={`w-8 h-8 rounded-full ${WALLET_ACCENT_STYLES[a].dot} transition ${
                  accent === a
                    ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-charcoal scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
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
          {editingWallet ? 'Simpan Perubahan' : 'Simpan Dompet / Buku'}
        </button>
      </form>
    </ModalSheet>
  );
};
