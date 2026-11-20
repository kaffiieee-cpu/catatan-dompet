import {
  AppState,
  BillPaymentRecord,
  DebtRecord,
  MandatoryBill,
  Transaction,
  Wallet,
} from '../types/finance';
import { clampDueDay, pad2 } from '../utils/format';
import { CURRENT_SCHEMA_VERSION } from '../utils/platform';

function makeDate(year: number, monthIndex: number, day: number): string {
  const safeDay = clampDueDay(year, monthIndex, day);
  return `${year}-${pad2(monthIndex + 1)}-${pad2(safeDay)}`;
}

export function createEmptyState(theme: 'light' | 'dark' = 'light'): AppState {
  const nowIso = new Date().toISOString();
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    theme,
    wallets: [
      {
        id: 'w_cash_default',
        name: 'Dompet Tunai',
        type: 'cash',
        initialBalance: 0,
        historicalAdjustment: 0,
        accent: 'emerald',
        note: 'Uang tunai pegangan harian',
        createdAt: nowIso,
      },
      {
        id: 'w_bank_default',
        name: 'Rekening Utama',
        type: 'bank',
        initialBalance: 0,
        historicalAdjustment: 0,
        accent: 'blue',
        note: 'Gaji & operasional',
        createdAt: nowIso,
      },
    ],
    transactions: [],
    bills: [],
    billPayments: [],
    debts: [],
    lastPrunedAt: null,
    lastPrunedCount: 0,
  };
}

export function createDemoState(): AppState {
  const now = new Date();
  const createdAt = now.toISOString();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();
  const curMonthKey = `${curYear}-${pad2(curMonth + 1)}`;

  const wallets: Wallet[] = [
    {
      id: 'w_cash',
      name: 'Dompet Tunai',
      type: 'cash',
      initialBalance: 1_250_000,
      historicalAdjustment: 0,
      accent: 'emerald',
      note: 'Uang cash harian',
      createdAt,
    },
    {
      id: 'w_bca',
      name: 'Bank BCA',
      type: 'bank',
      initialBalance: 6_400_000,
      historicalAdjustment: 0,
      accent: 'blue',
      note: 'Rekening Gaji & Operasional',
      createdAt,
    },
    {
      id: 'w_ewallet',
      name: 'GoPay & QRIS',
      type: 'bank',
      initialBalance: 850_000,
      historicalAdjustment: 0,
      accent: 'slate',
      note: 'Transaksi cepat & parkir',
      createdAt,
    },
    {
      id: 'w_btc',
      name: 'Buku BTC',
      type: 'investment',
      initialBalance: 4_500_000,
      historicalAdjustment: 0,
      accent: 'amber',
      note: '0.0048 BTC • Spot DCA',
      createdAt,
    },
    {
      id: 'w_saham',
      name: 'Buku Saham',
      type: 'investment',
      initialBalance: 7_200_000,
      historicalAdjustment: 0,
      accent: 'violet',
      note: 'BBCA, BBRI, TLKM',
      createdAt,
    },
    {
      id: 'w_exness',
      name: 'Depo Exness',
      type: 'investment',
      initialBalance: 2_800_000,
      historicalAdjustment: 0,
      accent: 'rose',
      note: 'Akun Exness Standard',
      createdAt,
    },
  ];

  const bills: MandatoryBill[] = [
    {
      id: 'bill_listrik',
      name: 'Listrik PLN',
      amount: 450_000,
      dueDay: 5,
      category: 'Utilitas',
      note: 'Token listrik rumah & kantor',
      createdAt,
    },
    {
      id: 'bill_air',
      name: 'Air PDAM',
      amount: 135_000,
      dueDay: 10,
      category: 'Utilitas',
      note: 'Tagihan air bulanan',
      createdAt,
    },
    {
      id: 'bill_gaji',
      name: 'Gaji Karyawan',
      amount: 3_500_000,
      dueDay: 25,
      category: 'Operasional',
      note: 'Gaji admin & operasional',
      createdAt,
    },
    {
      id: 'bill_ai',
      name: 'Langganan AI & Cloud',
      amount: 330_000,
      dueDay: Math.min(28, Math.max(now.getDate() + 3, 22)),
      category: 'Langganan',
      note: 'AI Pro, domain & server',
      createdAt,
    },
    {
      id: 'bill_internet',
      name: 'Internet & Kuota',
      amount: 385_000,
      dueDay: 27,
      category: 'Utilitas',
      note: 'WiFi rumah + paket data HP',
      createdAt,
    },
  ];

  const transactions: Transaction[] = [];
  const billPayments: BillPaymentRecord[] = [];
  let txCounter = 1;
  const pushTx = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    transactions.push({
      ...tx,
      id: `tx_demo_${txCounter++}`,
      createdAt,
    });
  };

  // Generate 11 bulan sebelumnya agar grafik 6 Bulan & 1 Tahun realistis
  for (let offset = 11; offset >= 1; offset--) {
    const d = new Date(curYear, curMonth - offset, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const mKey = `${y}-${pad2(m + 1)}`;

    // Pemasukan bulanan
    const salary = 7_500_000;
    const bizBonus = offset % 3 === 0 ? 1_850_000 : offset % 2 === 0 ? 1_200_000 : 800_000;
    const tradingProfit = offset % 4 === 0 ? 0 : 950_000 + (offset % 3) * 250_000;

    pushTx({
      type: 'income',
      amount: salary,
      category: 'Gaji',
      walletId: 'w_bca',
      date: makeDate(y, m, 1),
      note: 'Gaji bulanan',
    });

    pushTx({
      type: 'income',
      amount: bizBonus,
      category: 'Bisnis',
      walletId: 'w_bca',
      date: makeDate(y, m, 14),
      note: 'Pendapatan proyek sampingan',
    });

    if (tradingProfit > 0) {
      pushTx({
        type: 'income',
        amount: tradingProfit,
        category: 'Profit Trading',
        walletId: 'w_exness',
        date: makeDate(y, m, 19),
        note: 'Realisasi profit bulanan',
      });
    }

    // Tagihan wajib yang sudah lunas di bulan-bulan sebelumnya
    const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
    pushTx({
      type: 'expense',
      amount: totalBills,
      category: 'Tagihan Wajib',
      walletId: 'w_bca',
      date: makeDate(y, m, 24),
      note: 'Pelunasan seluruh tagihan wajib bulanan',
    });

    for (const b of bills) {
      billPayments.push({
        id: `bp_demo_${mKey}_${b.id}`,
        billId: b.id,
        monthKey: mKey,
        amount: b.amount,
        paidAt: makeDate(y, m, Math.min(b.dueDay, 25)),
        fundingType: 'wallet',
        walletId: 'w_bca',
      });
    }

    // Pengeluaran harian
    pushTx({
      type: 'expense',
      amount: 1_450_000 + (offset % 3) * 180_000,
      category: 'Makan',
      walletId: 'w_cash',
      date: makeDate(y, m, 12),
      note: 'Belanja makan & dapur',
    });

    pushTx({
      type: 'expense',
      amount: 420_000 + (offset % 2) * 90_000,
      category: 'Bensin',
      walletId: 'w_ewallet',
      date: makeDate(y, m, 16),
      note: 'BBM & transportasi',
    });

    pushTx({
      type: 'expense',
      amount: 380_000 + (offset % 4) * 120_000,
      category: 'Jajan',
      walletId: 'w_ewallet',
      date: makeDate(y, m, 20),
      note: 'Kopi, camilan & nongkrong',
    });

    // Bulan tertentu ada pengeluaran ekstra agar variasi grafik terasa nyata
    if (offset === 2) {
      pushTx({
        type: 'expense',
        amount: 2_600_000,
        category: 'Operasional',
        walletId: 'w_bca',
        date: makeDate(y, m, 18),
        note: 'Servis kendaraan & beli perangkat kerja',
      });
    }

    // Alokasi investasi & top-up cash
    pushTx({
      type: 'transfer',
      amount: 750_000,
      category: 'Alokasi Investasi',
      walletId: 'w_bca',
      targetWalletId: offset % 2 === 0 ? 'w_btc' : 'w_saham',
      date: makeDate(y, m, 6),
      note: offset % 2 === 0 ? 'DCA rutin Bitcoin' : 'Top up portofolio saham',
    });

    pushTx({
      type: 'transfer',
      amount: 1_500_000,
      category: 'Pindah Buku',
      walletId: 'w_bca',
      targetWalletId: 'w_cash',
      date: makeDate(y, m, 4),
      note: 'Tarik tunai ATM untuk kas harian',
    });

    pushTx({
      type: 'transfer',
      amount: 900_000,
      category: 'Pindah Buku',
      walletId: 'w_bca',
      targetWalletId: 'w_ewallet',
      date: makeDate(y, m, 5),
      note: 'Isi saldo GoPay & QRIS',
    });
  }

  // Transaksi bulan berjalan (sebagian tagihan wajib sudah dibayar, sisanya belum)
  const todayDay = now.getDate();
  const safeDay = (d: number) => Math.min(d, todayDay);

  pushTx({
    type: 'income',
    amount: 7_500_000,
    category: 'Gaji',
    walletId: 'w_bca',
    date: makeDate(curYear, curMonth, safeDay(1)),
    note: 'Gaji bulan berjalan',
  });

  pushTx({
    type: 'income',
    amount: 1_450_000,
    category: 'Bisnis',
    walletId: 'w_bca',
    date: makeDate(curYear, curMonth, safeDay(8)),
    note: 'Proyek desain & konsultasi',
  });

  // Tagihan Listrik & Air sudah LUNAS bulan ini
  const listrikTxId = `tx_demo_cur_listrik`;
  transactions.push({
    id: listrikTxId,
    type: 'expense',
    amount: 450_000,
    category: 'Tagihan Wajib',
    walletId: 'w_bca',
    date: makeDate(curYear, curMonth, safeDay(5)),
    note: 'Bayar tagihan wajib: Listrik PLN',
    relatedBillId: 'bill_listrik',
    createdAt,
  });
  billPayments.push({
    id: `bp_demo_${curMonthKey}_listrik`,
    billId: 'bill_listrik',
    monthKey: curMonthKey,
    amount: 450_000,
    paidAt: makeDate(curYear, curMonth, safeDay(5)),
    fundingType: 'wallet',
    walletId: 'w_bca',
    transactionId: listrikTxId,
  });

  const airTxId = `tx_demo_cur_air`;
  transactions.push({
    id: airTxId,
    type: 'expense',
    amount: 135_000,
    category: 'Tagihan Wajib',
    walletId: 'w_ewallet',
    date: makeDate(curYear, curMonth, safeDay(10)),
    note: 'Bayar tagihan wajib: Air PDAM',
    relatedBillId: 'bill_air',
    createdAt,
  });
  billPayments.push({
    id: `bp_demo_${curMonthKey}_air`,
    billId: 'bill_air',
    monthKey: curMonthKey,
    amount: 135_000,
    paidAt: makeDate(curYear, curMonth, safeDay(10)),
    fundingType: 'wallet',
    walletId: 'w_ewallet',
    transactionId: airTxId,
  });

  pushTx({
    type: 'expense',
    amount: 1_120_000,
    category: 'Makan',
    walletId: 'w_cash',
    date: makeDate(curYear, curMonth, safeDay(11)),
    note: 'Belanja bahan makan & warung',
  });

  pushTx({
    type: 'expense',
    amount: 285_000,
    category: 'Bensin',
    walletId: 'w_ewallet',
    date: makeDate(curYear, curMonth, safeDay(13)),
    note: 'Isi bensin & tol',
  });

  pushTx({
    type: 'expense',
    amount: 240_000,
    category: 'Jajan',
    walletId: 'w_cash',
    date: makeDate(curYear, curMonth, safeDay(15)),
    note: 'Ngopi & camilan sore',
  });

  pushTx({
    type: 'transfer',
    amount: 1_000_000,
    category: 'Alokasi Investasi',
    walletId: 'w_bca',
    targetWalletId: 'w_btc',
    date: makeDate(curYear, curMonth, safeDay(6)),
    note: 'Alokasi DCA Bitcoin bulanan',
  });

  pushTx({
    type: 'transfer',
    amount: 750_000,
    category: 'Alokasi Trading',
    walletId: 'w_bca',
    targetWalletId: 'w_exness',
    date: makeDate(curYear, curMonth, safeDay(9)),
    note: 'Top up modal akun Exness',
  });

  // 1 contoh catatan utang aktif
  const debtRepayTxId = 'tx_demo_debt_repay_1';
  transactions.push({
    id: debtRepayTxId,
    type: 'expense',
    amount: 500_000,
    category: 'Bayar Utang',
    walletId: 'w_bca',
    date: makeDate(curYear, curMonth, safeDay(12)),
    note: 'Cicil utang ke Mas Budi',
    relatedDebtId: 'debt_demo_1',
    createdAt,
  });

  const debts: DebtRecord[] = [
    {
      id: 'debt_demo_1',
      lenderName: 'Mas Budi',
      initialAmount: 1_500_000,
      remainingAmount: 1_000_000,
      date: makeDate(curYear, curMonth, safeDay(3)),
      note: 'Talangan servis kendaraan & stok operasional',
      status: 'unpaid',
      payments: [
        {
          id: 'dp_demo_1',
          amount: 500_000,
          date: makeDate(curYear, curMonth, safeDay(12)),
          walletId: 'w_bca',
          transactionId: debtRepayTxId,
        },
      ],
      createdAt,
    },
  ];

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    theme: 'light',
    wallets,
    transactions,
    bills,
    billPayments,
    debts,
    lastPrunedAt: now.toISOString(),
    lastPrunedCount: 0,
  };
}
