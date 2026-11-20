import React, { useEffect, useState } from 'react';
import { DebtRecord } from '../types/finance';
import { getTodayIso } from '../utils/format';
import { CurrencyInput } from './CurrencyInput';
import { ModalSheet } from './ModalSheet';

interface DebtFormModalProps {
  open: boolean;
  editingDebt: DebtRecord | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    lenderName: string;
    initialAmount: number;
    date: string;
    note?: string;
  }) => void;
}

export const DebtFormModal: React.FC<DebtFormModalProps> = ({
  open,
  editingDebt,
  onClose,
  onSave,
}) => {
  const [lenderName, setLenderName] = useState('');
  const [initialAmount, setInitialAmount] = useState(0);
  const [date, setDate] = useState(getTodayIso());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingDebt) {
      setLenderName(editingDebt.lenderName);
      setInitialAmount(editingDebt.initialAmount);
      setDate(editingDebt.date);
      setNote(editingDebt.note ?? '');
    } else {
      setLenderName('');
      setInitialAmount(0);
      setDate(getTodayIso());
      setNote('');
    }
    setError('');
  }, [open, editingDebt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lenderName.trim()) {
      setError('Nama pemberi pinjaman wajib diisi.');
      return;
    }
    if (initialAmount <= 0) {
      setError('Nominal pinjaman harus lebih dari Rp 0.');
      return;
    }
    onSave({
      id: editingDebt?.id,
      lenderName: lenderName.trim(),
      initialAmount,
      date,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title={editingDebt ? 'Ubah Catatan Utang' : 'Tambah Catatan Utang'}
      subtitle="Catat pinjaman agar mudah dipantau dan dilunasi"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Pinjam ke Siapa (Nama)
          </label>
          <input
            type="text"
            value={lenderName}
            onChange={(e) => setLenderName(e.target.value)}
            placeholder="Contoh: Mas Budi, Orang Tua, Koperasi"
            required
            className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Nominal Utang
            </label>
            <CurrencyInput value={initialAmount} onChange={setInitialAmount} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Tanggal Pinjam
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Keperluan / Catatan (Opsional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Misal: Talangan tagihan listrik / servis kendaraan"
            className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-sm transition"
        >
          {editingDebt ? 'Simpan Perubahan' : 'Simpan Catatan Utang'}
        </button>
      </form>
    </ModalSheet>
  );
};
