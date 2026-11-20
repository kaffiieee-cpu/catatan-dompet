import React from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Coins,
  CreditCard,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  AppTab,
  BillPaymentRecord,
  DebtRecord,
  MandatoryBill,
  Transaction,
  Wallet,
} from '../types/finance';
import {
  computeNetWorthSummary,
  getBillPaymentForMonth,
} from '../utils/calculations';
import {
  formatMonthYearId,
  formatRupiah,
  getCurrentMonthKey,
  getDaysUntilDue,
} from '../utils/format';

interface BerandaPageProps {
  wallets: Wallet[];
  balances: Record<string, number>;
  transactions: Transaction[];
  bills: MandatoryBill[];
  billPayments: BillPaymentRecord[];
  debts: DebtRecord[];
  onPayBill: (bill: MandatoryBill) => void;
  onNavigate: (tab: AppTab) => void;
}

export const BerandaPage: React.FC<BerandaPageProps> = ({
  wallets,
  balances,
  transactions,
  bills,
  billPayments,
  debts,
  onPayBill,
  onNavigate,
}) => {
  const monthKey = getCurrentMonthKey();
  const monthLabel = formatMonthYearId(monthKey);
  const netWorth = computeNetWorthSummary(wallets, balances, debts);

  // Target Pengeluaran Wajib Bulan Ini
  const billStatuses = bills.map((bill) => {
    const payment = getBillPaymentForMonth(bill.id, monthKey, billPayments);
    const daysLeft = getDaysUntilDue(bill.dueDay);
    return { bill, payment, daysLeft };
  });

  const totalMandatoryTarget = billStatuses.reduce(
    (sum, item) => sum + (item.payment ? item.payment.amount : item.bill.amount),
    0,
  );
  const totalMandatoryPaid = billStatuses.reduce(
    (sum, item) => sum + (item.payment ? item.payment.amount : 0),
    0,
  );
  const totalMandatoryRemaining = Math.max(0, totalMandatoryTarget - totalMandatoryPaid);
  const mandatoryProgress =
    totalMandatoryTarget > 0
      ? Math.min(100, Math.round((totalMandatoryPaid / totalMandatoryTarget) * 100))
      : 0;

  const unpaidBills = billStatuses
    .filter((item) => !item.payment)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Ringkasan Bulan Berjalan
  const monthTx = transactions.filter((tx) => tx.date.startsWith(monthKey));
  const monthIncome = monthTx
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthExpense = monthTx
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthNet = monthIncome - monthExpense;
  const isMines = monthNet < 0;

  const activeDebtsThisMonth = debts.filter(
    (d) => d.date.startsWith(monthKey) && d.status === 'unpaid' && d.remainingAmount > 0,
  );

  return (
    <div className="space-y-4">
      {/* Net Worth Summary Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-5 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 wallet-pattern-dots opacity-40 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-emerald-200/90">
                Total Dana Cair (Tunai + Bank/E-Wallet)
              </p>
              <p className="text-3xl font-extrabold num-tabular tracking-tight mt-1">
                {formatRupiah(netWorth.totalLiquid)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Buku Pribadi
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('dompet')}
              className="text-left rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-sm p-3 transition"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
                <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                <span>Investasi & Trading</span>
              </div>
              <p className="text-base font-bold num-tabular text-white mt-1 truncate">
                {formatRupiah(netWorth.totalInvestment)}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('dompet')}
              className="text-left rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-sm p-3 transition"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
                <CreditCard className="w-3.5 h-3.5 text-rose-300" />
                <span>Total Utang Aktif</span>
              </div>
              <p
                className={`text-base font-bold num-tabular mt-1 truncate ${
                  netWorth.totalActiveDebt > 0 ? 'text-rose-300' : 'text-emerald-300'
                }`}
              >
                {formatRupiah(netWorth.totalActiveDebt)}
              </p>
            </button>
          </div>

          <p className="text-[11px] text-slate-300/80 leading-relaxed">
            * Hanya pencatatan buku nominal pribadi secara offline, bukan saldo real-time rekening bank.
          </p>
        </div>
      </section>

      {/* Prominent Target Pengeluaran Wajib Bulan Ini */}
      <section className="bento-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Disiplin Bulanan • {monthLabel}
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              Target Pengeluaran Wajib Bulan Ini
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('wajib')}
            className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-2xl bg-alabaster dark:bg-obsidian border border-sandline dark:border-slateborder p-4 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Kewajiban Rutin
            </span>
            <span className="text-xl font-extrabold num-tabular text-slate-900 dark:text-white">
              {formatRupiah(totalMandatoryTarget)}
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${mandatoryProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Sudah Dibayar ({mandatoryProgress}%)
              </p>
              <p className="text-sm font-bold num-tabular text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatRupiah(totalMandatoryPaid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Sisa Yang Harus Disiapkan
              </p>
              <p
                className={`text-sm font-bold num-tabular mt-0.5 ${
                  totalMandatoryRemaining > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatRupiah(totalMandatoryRemaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Daftar Cepat Tagihan Belum Bayar */}
        {bills.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Belum ada tagihan wajib bulanan. Tambahkan di tab Wajib.
            </p>
          </div>
        ) : unpaidBills.length === 0 ? (
          <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-4 py-3 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold">
              Mantap! Semua tagihan wajib bulan {monthLabel} sudah lunas.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Belum Dibayar ({unpaidBills.length})
            </p>
            {unpaidBills.slice(0, 4).map(({ bill, daysLeft }) => {
              const isOverdue = daysLeft < 0;
              const isDueSoon = daysLeft >= 0 && daysLeft <= 7;
              return (
                <div
                  key={bill.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-sandline dark:border-slateborder bg-white dark:bg-obsidian/60 px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {bill.name}
                      </p>
                      <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : isDueSoon
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {isOverdue
                          ? `Lewat ${Math.abs(daysLeft)} hr`
                          : daysLeft === 0
                            ? 'Hari ini'
                            : `H-${daysLeft} (Tgl ${bill.dueDay})`}
                      </span>
                    </div>
                    <p className="text-xs font-bold num-tabular text-slate-600 dark:text-slate-300 mt-0.5">
                      {formatRupiah(bill.amount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPayBill(bill)}
                    className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2 shadow-sm transition"
                  >
                    Bayar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Ringkasan Bulan Ini (Surplus / Mines) */}
      <section className="bento-card p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Ringkasan {monthLabel}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pemasukan vs pengeluaran bulan berjalan
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold ${
              isMines
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            {isMines ? 'MINES' : 'SURPLUS'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <ArrowDownLeft className="w-4 h-4" />
              <span>Pemasukan</span>
            </div>
            <p className="text-base font-extrabold num-tabular text-emerald-800 dark:text-emerald-200 mt-1">
              {formatRupiah(monthIncome)}
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <ArrowUpRight className="w-4 h-4" />
              <span>Pengeluaran</span>
            </div>
            <p className="text-base font-extrabold num-tabular text-rose-800 dark:text-rose-200 mt-1">
              {formatRupiah(monthExpense)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-alabaster dark:bg-obsidian border border-sandline dark:border-slateborder px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Coins className="w-4 h-4 text-slate-500" />
            <span>Selisih Arus Kas</span>
          </div>
          <span
            className={`text-sm font-extrabold num-tabular ${
              isMines
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatRupiah(monthNet, true)}
          </span>
        </div>

        {isMines && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Bulan ini sedang mines {formatRupiah(Math.abs(monthNet))}
              </span>
            </div>
            {activeDebtsThisMonth.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                  Ringkasan pinjaman aktif bulan ini:
                </p>
                {activeDebtsThisMonth.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between text-xs text-rose-900 dark:text-rose-100"
                  >
                    <span>• Pinjam ke {d.lenderName}</span>
                    <span className="font-bold num-tabular">
                      Sisa {formatRupiah(d.remainingAmount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                Belum ada catatan pinjaman baru bulan ini. Pengeluaran tertutup dari cadangan saldo dompet.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
