import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { BillPaymentRecord, MandatoryBill, Wallet } from '../types/finance';
import { getBillPaymentForMonth } from '../utils/calculations';
import {
  formatDateId,
  formatMonthYearId,
  formatRupiah,
  getCurrentMonthKey,
  getDaysUntilDue,
} from '../utils/format';
import { NotificationSyncStatus } from '../utils/notifications';
import { isNativeApp } from '../utils/platform';

interface WajibPageProps {
  bills: MandatoryBill[];
  billPayments: BillPaymentRecord[];
  wallets: Wallet[];
  reminderStatus: NotificationSyncStatus;
  onAddBill: () => void;
  onEditBill: (bill: MandatoryBill) => void;
  onDeleteBill: (billId: string) => void;
  onPayBill: (bill: MandatoryBill) => void;
  onUndoBillPayment: (payment: BillPaymentRecord) => void;
}

type BillFilter = 'all' | 'unpaid' | 'paid';

export const WajibPage: React.FC<WajibPageProps> = ({
  bills,
  billPayments,
  wallets,
  reminderStatus,
  onAddBill,
  onEditBill,
  onDeleteBill,
  onPayBill,
  onUndoBillPayment,
}) => {
  const [filter, setFilter] = useState<BillFilter>('all');
  const monthKey = getCurrentMonthKey();
  const monthLabel = formatMonthYearId(monthKey);
  const walletMap = new Map(wallets.map((w) => [w.id, w.name]));

  const items = bills
    .map((bill) => ({
      bill,
      payment: getBillPaymentForMonth(bill.id, monthKey, billPayments),
      daysLeft: getDaysUntilDue(bill.dueDay),
    }))
    .sort((a, b) => {
      if (Boolean(a.payment) !== Boolean(b.payment)) {
        return a.payment ? 1 : -1;
      }
      return a.bill.dueDay - b.bill.dueDay;
    });

  const totalMonthly = items.reduce(
    (sum, item) => sum + (item.payment ? item.payment.amount : item.bill.amount),
    0,
  );
  const paidCount = items.filter((i) => Boolean(i.payment)).length;
  const unpaidCount = items.length - paidCount;

  const filteredItems = items.filter((i) => {
    if (filter === 'paid') return Boolean(i.payment);
    if (filter === 'unpaid') return !i.payment;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Total Pengeluaran Wajib */}
      <section className="bento-card p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Kewajiban Rutin • {monthLabel}
            </p>
            <p className="text-2xl font-extrabold num-tabular text-slate-900 dark:text-white mt-0.5">
              {formatRupiah(totalMonthly)}
            </p>
          </div>
          <button
            type="button"
            onClick={onAddBill}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-sandline dark:border-slateborder">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              {paidCount} Lunas
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              {unpaidCount} Belum Bayar
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
              isNativeApp() && reminderStatus.granted
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {isNativeApp() && reminderStatus.granted ? (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>Pengingat H-7 Aktif ({reminderStatus.scheduledCount})</span>
              </>
            ) : isNativeApp() ? (
              <>
                <BellOff className="w-3.5 h-3.5" />
                <span>Izin Notifikasi Belum Aktif</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>Pengingat H-7 Aktif di APK Android</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {(
          [
            { id: 'all', label: `Semua (${items.length})` },
            { id: 'unpaid', label: `Belum Bayar (${unpaidCount})` },
            { id: 'paid', label: `Lunas (${paidCount})` },
          ] as Array<{ id: BillFilter; label: string }>
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              filter === tab.id
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-500'
                : 'bg-white dark:bg-charcoal border-sandline dark:border-slateborder text-slate-600 dark:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Tagihan */}
      {filteredItems.length === 0 ? (
        <div className="bento-card p-8 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Tidak ada tagihan pada filter ini
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tambahkan kewajiban bulanan seperti Listrik, Air, Gaji Karyawan, atau Langganan AI.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map(({ bill, payment, daysLeft }) => {
            const isPaid = Boolean(payment);
            const isOverdue = !isPaid && daysLeft < 0;
            const isDueSoon = !isPaid && daysLeft >= 0 && daysLeft <= 7;

            const sourceLabel = payment
              ? payment.fundingType === 'debt'
                ? `Utang ke ${payment.lenderName ?? 'Pemberi Pinjaman'}`
                : walletMap.get(payment.walletId ?? '') ?? 'Dompet'
              : '';

            return (
              <div
                key={bill.id}
                className={`bento-card p-4 transition ${
                  isPaid ? 'border-emerald-200 dark:border-emerald-900/60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {bill.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {bill.category}
                      </span>
                    </div>

                    <p className="text-lg font-extrabold num-tabular text-slate-900 dark:text-slate-100 mt-1">
                      {formatRupiah(payment ? payment.amount : bill.amount)}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                      {isPaid && payment ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          LUNAS • {sourceLabel} • {formatDateId(payment.paidAt)}
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            BELUM BAYAR
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              isOverdue
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : isDueSoon
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Jatuh tempo tgl {bill.dueDay} (
                            {isOverdue
                              ? `terlambat ${Math.abs(daysLeft)} hari`
                              : daysLeft === 0
                                ? 'hari ini'
                                : `${daysLeft} hari lagi`}
                            )
                          </span>
                        </>
                      )}
                    </div>

                    {bill.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                        {bill.note}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {isPaid && payment ? (
                      <button
                        type="button"
                        onClick={() => onUndoBillPayment(payment)}
                        className="inline-flex items-center gap-1 rounded-xl border border-sandline dark:border-slateborder px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Batalkan</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPayBill(bill)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-4 py-2 shadow-sm transition"
                      >
                        Bayar
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditBill(bill)}
                        aria-label="Ubah tagihan"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteBill(bill.id)}
                        aria-label="Hapus tagihan"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center px-2">
        Status tagihan otomatis kembali menjadi BELUM BAYAR saat memasuki bulan kalender baru tanpa menghapus riwayat pembayaran sebelumnya.
      </p>
    </div>
  );
};
