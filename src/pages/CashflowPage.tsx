import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AppTheme,
  DebtRecord,
  PeriodFilter,
  Transaction,
  Wallet,
} from '../types/finance';
import {
  buildCashflowChartData,
  buildExpenseCategoryBreakdown,
  filterDebtsByPeriod,
  filterTransactionsByPeriod,
} from '../utils/calculations';
import {
  formatCompactRupiah,
  formatDateId,
  formatRupiah,
} from '../utils/format';

interface CashflowPageProps {
  transactions: Transaction[];
  wallets: Wallet[];
  debts: DebtRecord[];
  theme: AppTheme;
  onDeleteTransaction: (txId: string) => void;
}

const PERIOD_OPTIONS: Array<{ id: PeriodFilter; label: string }> = [
  { id: '1m', label: '1 Bulan' },
  { id: '6m', label: '6 Bulan' },
  { id: '1y', label: '1 Tahun' },
];

export const CashflowPage: React.FC<CashflowPageProps> = ({
  transactions,
  wallets,
  debts,
  theme,
  onDeleteTransaction,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('1m');
  const [search, setSearch] = useState('');

  const walletMap = useMemo(
    () => new Map(wallets.map((w) => [w.id, w.name])),
    [wallets],
  );

  const periodTx = useMemo(
    () => filterTransactionsByPeriod(transactions, period),
    [transactions, period],
  );

  const periodDebts = useMemo(
    () => filterDebtsByPeriod(debts, period),
    [debts, period],
  );

  const totalIncome = useMemo(
    () =>
      periodTx
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [periodTx],
  );

  const totalExpense = useMemo(
    () =>
      periodTx
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [periodTx],
  );

  const netCashflow = totalIncome - totalExpense;
  const isMines = netCashflow < 0;

  const chartData = useMemo(
    () => buildCashflowChartData(periodTx, period),
    [periodTx, period],
  );

  const categoryBreakdown = useMemo(
    () => buildExpenseCategoryBreakdown(periodTx, wallets),
    [periodTx, wallets],
  );

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...periodTx]
      .filter((tx) => {
        if (!q) return true;
        const wName = (walletMap.get(tx.walletId) ?? '').toLowerCase();
        const targetName = tx.targetWalletId
          ? (walletMap.get(tx.targetWalletId) ?? '').toLowerCase()
          : '';
        return (
          tx.category.toLowerCase().includes(q) ||
          (tx.note ?? '').toLowerCase().includes(q) ||
          wName.includes(q) ||
          targetName.includes(q)
        );
      })
      .sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt),
      );
  }, [periodTx, search, walletMap]);

  const axisColor = theme === 'dark' ? '#94A3B8' : '#64748B';
  const gridColor = theme === 'dark' ? '#232936' : '#E6E4DC';

  return (
    <div className="space-y-4">
      {/* Filter Periode (EXACTLY 3 OPTIONS: 1 Bulan, 6 Bulan, 1 Tahun) */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-charcoal border border-sandline dark:border-slateborder shadow-bento">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setPeriod(opt.id)}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition ${
              period === opt.id
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Ringkasan Pemasukan, Pengeluaran, Surplus/Mines */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bento-card p-4">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Total Pemasukan
          </p>
          <p className="text-lg font-extrabold num-tabular text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRupiah(totalIncome)}
          </p>
        </div>

        <div className="bento-card p-4">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Total Pengeluaran
          </p>
          <p className="text-lg font-extrabold num-tabular text-rose-600 dark:text-rose-400 mt-1">
            {formatRupiah(totalExpense)}
          </p>
        </div>

        <div className="bento-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Arus Kas Bersih
            </p>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isMines
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              {isMines ? 'Mines' : 'Surplus'}
            </span>
          </div>
          <p
            className={`text-lg font-extrabold num-tabular mt-1 ${
              isMines
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatRupiah(netCashflow, true)}
          </p>
        </div>
      </section>

      {/* Kartu Rincian Defisit / Mines */}
      {isMines && (
        <section className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-100">
                Periode Ini Mengalami Mines {formatRupiah(Math.abs(netCashflow))}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Pengeluaran lebih besar daripada pemasukan pada rentang waktu yang dipilih.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white/80 dark:bg-obsidian/60 p-3 space-y-1.5">
            <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
              Daftar Pinjaman / Utang Pada Periode Ini:
            </p>
            {periodDebts.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Tidak ada catatan pinjaman baru pada periode ini (defisit ditutup dari saldo tabungan/dompet).
              </p>
            ) : (
              periodDebts.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between text-xs text-slate-800 dark:text-slate-200"
                >
                  <span>
                    • <strong>{d.lenderName}</strong> ({formatDateId(d.date)})
                  </span>
                  <span className="font-bold num-tabular text-rose-600 dark:text-rose-400">
                    {formatRupiah(d.initialAmount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Grafik Perbandingan Pemasukan vs Pengeluaran */}
      <section className="bento-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Grafik Pemasukan vs Pengeluaran
          </h3>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Masuk
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              Keluar
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCompactRupiah(Number(v))}
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }}
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#151921' : '#FFFFFF',
                  borderColor: theme === 'dark' ? '#232936' : '#E6E4DC',
                  borderRadius: '14px',
                  fontSize: '12px',
                  color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
                }}
                formatter={(value: number, name: string) => [
                  formatRupiah(value),
                  name === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
                ]}
              />
              <Bar dataKey="pemasukan" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={26} />
              <Bar dataKey="pengeluaran" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Rincian Pengeluaran & Alokasi per Kategori */}
      <section className="bento-card p-4 space-y-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Rincian Pengeluaran & Alokasi Aset
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Termasuk alokasi pindah buku ke investasi & trading
          </p>
        </div>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
            Belum ada pengeluaran pada periode ini.
          </p>
        ) : (
          <div className="space-y-2.5">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>{item.category}</span>
                    {item.isAllocation && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Aset
                      </span>
                    )}
                  </span>
                  <span className="num-tabular font-bold text-slate-700 dark:text-slate-200">
                    {formatRupiah(item.amount)}{' '}
                    <span className="text-slate-400 font-medium">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.isAllocation ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(4, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Daftar Transaksi dengan Pencarian */}
      <section className="bento-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Daftar Transaksi ({filteredTransactions.length})
          </h3>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kategori, catatan, atau nama dompet..."
            className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
            Tidak ada transaksi yang cocok dengan pencarian Anda.
          </p>
        ) : (
          <div className="divide-y divide-sandline dark:divide-slateborder">
            {filteredTransactions.slice(0, 60).map((tx) => {
              const sourceName = walletMap.get(tx.walletId) ?? 'Dompet';
              const targetName = tx.targetWalletId
                ? walletMap.get(tx.targetWalletId) ?? 'Dompet'
                : '';

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : tx.type === 'transfer'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : tx.type === 'transfer' ? (
                        <ArrowLeftRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {tx.type === 'transfer'
                          ? `${sourceName} → ${targetName}`
                          : tx.category}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {formatDateId(tx.date)} •{' '}
                        {tx.type === 'transfer' ? 'Pindah Buku' : sourceName}
                        {tx.note ? ` • ${tx.note}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-sm font-extrabold num-tabular ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : tx.type === 'transfer'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {tx.type === 'income'
                        ? formatRupiah(tx.amount, true)
                        : tx.type === 'transfer'
                          ? formatRupiah(tx.amount)
                          : formatRupiah(-tx.amount, true)}
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
      </section>
    </div>
  );
};
