import React, { useEffect, useState } from 'react';
import { BILL_CATEGORIES, MandatoryBill } from '../types/finance';
import { CurrencyInput } from './CurrencyInput';
import { ModalSheet } from './ModalSheet';

interface BillFormModalProps {
  open: boolean;
  editingBill: MandatoryBill | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    amount: number;
    dueDay: number;
    category: string;
    note?: string;
  }) => void;
}

export const BillFormModal: React.FC<BillFormModalProps> = ({
  open,
  editingBill,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [dueDay, setDueDay] = useState(25);
  const [category, setCategory] = useState<string>(BILL_CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingBill) {
      setName(editingBill.name);
      setAmount(editingBill.amount);
      setDueDay(editingBill.dueDay);
      setCategory(editingBill.category);
      setNote(editingBill.note ?? '');
    } else {
      setName('');
      setAmount(0);
      setDueDay(25);
      setCategory(BILL_CATEGORIES[0]);
      setNote('');
    }
    setError('');
  }, [open, editingBill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama tagihan wajib diisi.');
      return;
    }
    if (amount <= 0) {
      setError('Nominal tagihan harus lebih dari Rp 0.');
      return;
    }
    const clampedDay = Math.min(31, Math.max(1, Math.round(dueDay || 1)));
    onSave({
      id: editingBill?.id,
      name: name.trim(),
      amount,
      dueDay: clampedDay,
      category,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title={editingBill ? 'Ubah Tagihan Wajib' : 'Tambah Tagihan Wajib'}
      subtitle="Akan otomatis muncul sebagai target disiplin setiap bulan"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Nama Tagihan / Kewajiban
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: Listrik PLN, Gaji Karyawan, Langganan AI"
            required
            className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Nominal Rutin Bulanan
            </label>
            <CurrencyInput value={amount} onChange={setAmount} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Tanggal Jatuh Tempo (1–31)
            </label>
            <input
              type="number"
              min={1}
              max={31}
              value={dueDay}
              onChange={(e) => setDueDay(Number(e.target.value))}
              required
              className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 px-3.5 py-3 text-sm font-semibold num-tabular text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Kategori
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BILL_CATEGORIES.map((cat) => (
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

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Catatan (Opsional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nomor meteran, ID pelanggan, atau keterangan lain"
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
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition"
        >
          {editingBill ? 'Simpan Perubahan' : 'Tambahkan Tagihan Wajib'}
        </button>
      </form>
    </ModalSheet>
  );
};
