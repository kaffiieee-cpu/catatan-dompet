import { useCallback, useEffect, useMemo, useState } from 'react';
import { BillFormModal } from './components/BillFormModal';
import { BottomNav } from './components/BottomNav';
import { DebtFormModal } from './components/DebtFormModal';
import { Header } from './components/Header';
import { PayBillModal } from './components/PayBillModal';
import { PayDebtModal } from './components/PayDebtModal';
import { QuickTransactionModal } from './components/QuickTransactionModal';
import { WalletFormModal } from './components/WalletFormModal';
import { WalletHistoryModal } from './components/WalletHistoryModal';
import { WebPreviewBanner } from './components/WebPreviewBanner';
import { createDemoState, createEmptyState } from './data/demoData';
import { BerandaPage } from './pages/BerandaPage';
import { CashflowPage } from './pages/CashflowPage';
import { DompetPage } from './pages/DompetPage';
import { SetelanPage } from './pages/SetelanPage';
import { WajibPage } from './pages/WajibPage';
import {
  AppState,
  AppTab,
  AppTheme,
  BillFundingType,
  BillPaymentRecord,
  DebtRecord,
  MandatoryBill,
  Transaction,
  Wallet,
  WalletAccent,
  WalletType,
} from './types/finance';
import {
  computeAllWalletBalances,
  getBillPaymentForMonth,
} from './utils/calculations';
import { generateId, getCurrentMonthKey, getTodayIso } from './utils/format';
import { NotificationSyncStatus, syncBillReminders } from './utils/notifications';
import {
  clearPersistedState,
  isNativeApp,
  loadPersistedState,
  savePersistedState,
  syncNativeStatusBar,
} from './utils/platform';
import { runFiveYearRetentionPrune } from './utils/retention';

function initializeAppState(): AppState {
  if (isNativeApp()) {
    const persisted = loadPersistedState();
    const baseState = persisted ?? createEmptyState('light');
    const pruned = runFiveYearRetentionPrune(baseState);
    savePersistedState(pruned.state);
    return pruned.state;
  }
  // Mode Preview Web: state sementara di memori saja (tanpa localStorage/IndexedDB)
  return createDemoState();
}

export function App() {
  const [state, setState] = useState<AppState>(() => initializeAppState());
  const [activeTab, setActiveTab] = useState<AppTab>('beranda');
  const [reminderStatus, setReminderStatus] = useState<NotificationSyncStatus>({
    supported: isNativeApp(),
    granted: false,
    scheduledCount: 0,
  });

  // Modal states
  const [quickTxOpen, setQuickTxOpen] = useState(false);
  const [payingBill, setPayingBill] = useState<MandatoryBill | null>(null);
  const [billFormOpen, setBillFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<MandatoryBill | null>(null);
  const [walletFormOpen, setWalletFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [historyWalletId, setHistoryWalletId] = useState<string | null>(null);
  const [debtFormOpen, setDebtFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtRecord | null>(null);
  const [payingDebt, setPayingDebt] = useState<DebtRecord | null>(null);

  // Sinkronisasi tema Light/Dark ke <html> & native StatusBar
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', state.theme === 'dark' ? '#0C0E12' : '#F6F5F0');
    }
    void syncNativeStatusBar(state.theme);
  }, [state.theme]);

  // Persistensi otomatis HANYA pada mode APK Android
  useEffect(() => {
    if (isNativeApp()) {
      savePersistedState(state);
    }
  }, [state]);

  // Sinkronisasi pengingat H-7 tagihan wajib (aman no-op di Web Preview)
  const refreshReminders = useCallback(async () => {
    const status = await syncBillReminders(state.bills, state.billPayments);
    setReminderStatus(status);
  }, [state.bills, state.billPayments]);

  useEffect(() => {
    void refreshReminders();
  }, [refreshReminders]);

  const balances = useMemo(
    () => computeAllWalletBalances(state.wallets, state.transactions),
    [state.wallets, state.transactions],
  );

  const currentMonthKey = getCurrentMonthKey();
  const unpaidBillsCount = useMemo(
    () =>
      state.bills.filter(
        (b) => !getBillPaymentForMonth(b.id, currentMonthKey, state.billPayments),
      ).length,
    [state.bills, state.billPayments, currentMonthKey],
  );

  const historyWallet = useMemo(
    () => state.wallets.find((w) => w.id === historyWalletId) ?? null,
    [state.wallets, historyWalletId],
  );

  // Handlers Tema
  const handleToggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleSetTheme = (theme: AppTheme) => {
    setState((prev) => ({ ...prev, theme }));
  };

  // Handlers Transaksi
  const handleAddTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: generateId('tx'),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const handleDeleteTransaction = (txId: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== txId),
    }));
  };

  // Handlers Tagihan Wajib
  const handleSaveBill = (data: {
    id?: string;
    name: string;
    amount: number;
    dueDay: number;
    category: string;
    note?: string;
  }) => {
    setState((prev) => {
      if (data.id) {
        return {
          ...prev,
          bills: prev.bills.map((b) =>
            b.id === data.id
              ? {
                  ...b,
                  name: data.name,
                  amount: data.amount,
                  dueDay: data.dueDay,
                  category: data.category,
                  note: data.note,
                }
              : b,
          ),
        };
      }
      const newBill: MandatoryBill = {
        id: generateId('bill'),
        name: data.name,
        amount: data.amount,
        dueDay: data.dueDay,
        category: data.category,
        note: data.note,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        bills: [...prev.bills, newBill],
      };
    });
  };

  const handleDeleteBill = (billId: string) => {
    setState((prev) => ({
      ...prev,
      bills: prev.bills.filter((b) => b.id !== billId),
      billPayments: prev.billPayments.filter((p) => p.billId !== billId),
    }));
  };

  const handleConfirmPayBill = (payload: {
    bill: MandatoryBill;
    amount: number;
    fundingType: BillFundingType;
    walletId?: string;
    lenderName?: string;
  }) => {
    const nowIso = new Date().toISOString();
    const today = getTodayIso();
    const monthKey = getCurrentMonthKey();

    setState((prev) => {
      // Cegah duplikasi pembayaran bulan yang sama
      const alreadyPaid = getBillPaymentForMonth(
        payload.bill.id,
        monthKey,
        prev.billPayments,
      );
      if (alreadyPaid) return prev;

      let nextTransactions = prev.transactions;
      let nextDebts = prev.debts;
      let createdTxId: string | undefined;
      let createdDebtId: string | undefined;

      if (payload.fundingType === 'wallet' && payload.walletId) {
        createdTxId = generateId('tx');
        const expenseTx: Transaction = {
          id: createdTxId,
          type: 'expense',
          amount: payload.amount,
          category: 'Tagihan Wajib',
          walletId: payload.walletId,
          date: today,
          note: `Bayar tagihan wajib: ${payload.bill.name}`,
          relatedBillId: payload.bill.id,
          createdAt: nowIso,
        };
        nextTransactions = [expenseTx, ...prev.transactions];
      } else if (payload.fundingType === 'debt' && payload.lenderName) {
        createdDebtId = generateId('debt');
        const newDebt: DebtRecord = {
          id: createdDebtId,
          lenderName: payload.lenderName,
          initialAmount: payload.amount,
          remainingAmount: payload.amount,
          date: today,
          note: `Bayar tagihan wajib: ${payload.bill.name}`,
          status: 'unpaid',
          relatedBillId: payload.bill.id,
          payments: [],
          createdAt: nowIso,
        };
        nextDebts = [newDebt, ...prev.debts];
      }

      const paymentRecord: BillPaymentRecord = {
        id: generateId('bp'),
        billId: payload.bill.id,
        monthKey,
        amount: payload.amount,
        paidAt: today,
        fundingType: payload.fundingType,
        walletId: payload.walletId,
        debtId: createdDebtId,
        lenderName: payload.lenderName,
        transactionId: createdTxId,
      };

      return {
        ...prev,
        transactions: nextTransactions,
        debts: nextDebts,
        billPayments: [paymentRecord, ...prev.billPayments],
      };
    });
  };

  const handleUndoBillPayment = (payment: BillPaymentRecord) => {
    setState((prev) => ({
      ...prev,
      billPayments: prev.billPayments.filter((p) => p.id !== payment.id),
      transactions: payment.transactionId
        ? prev.transactions.filter((t) => t.id !== payment.transactionId)
        : prev.transactions,
      debts: payment.debtId
        ? prev.debts.filter((d) => d.id !== payment.debtId)
        : prev.debts,
    }));
  };

  // Handlers Dompet
  const handleSaveWallet = (data: {
    id?: string;
    name: string;
    type: WalletType;
    initialBalance: number;
    accent: WalletAccent;
    note?: string;
  }) => {
    setState((prev) => {
      if (data.id) {
        return {
          ...prev,
          wallets: prev.wallets.map((w) =>
            w.id === data.id
              ? {
                  ...w,
                  name: data.name,
                  type: data.type,
                  initialBalance: data.initialBalance,
                  accent: data.accent,
                  note: data.note,
                }
              : w,
          ),
        };
      }
      const newWallet: Wallet = {
        id: generateId('w'),
        name: data.name,
        type: data.type,
        initialBalance: data.initialBalance,
        historicalAdjustment: 0,
        accent: data.accent,
        note: data.note,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        wallets: [...prev.wallets, newWallet],
      };
    });
  };

  const handleDeleteWallet = (walletId: string) => {
    setState((prev) => {
      if (prev.wallets.length <= 1) return prev;
      return {
        ...prev,
        wallets: prev.wallets.filter((w) => w.id !== walletId),
      };
    });
  };

  // Handlers Utang
  const handleSaveDebt = (data: {
    id?: string;
    lenderName: string;
    initialAmount: number;
    date: string;
    note?: string;
  }) => {
    setState((prev) => {
      if (data.id) {
        return {
          ...prev,
          debts: prev.debts.map((d) => {
            if (d.id !== data.id) return d;
            const totalPaid = d.payments.reduce((s, p) => s + p.amount, 0);
            const nextRemaining = Math.max(0, data.initialAmount - totalPaid);
            return {
              ...d,
              lenderName: data.lenderName,
              initialAmount: data.initialAmount,
              remainingAmount: nextRemaining,
              status: nextRemaining === 0 ? 'paid' : 'unpaid',
              date: data.date,
              note: data.note,
            };
          }),
        };
      }
      const newDebt: DebtRecord = {
        id: generateId('debt'),
        lenderName: data.lenderName,
        initialAmount: data.initialAmount,
        remainingAmount: data.initialAmount,
        date: data.date,
        note: data.note,
        status: 'unpaid',
        payments: [],
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        debts: [newDebt, ...prev.debts],
      };
    });
  };

  const handleDeleteDebt = (debtId: string) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== debtId),
    }));
  };

  const handleConfirmPayDebt = (payload: {
    debt: DebtRecord;
    amount: number;
    walletId: string;
  }) => {
    const nowIso = new Date().toISOString();
    const today = getTodayIso();
    const txId = generateId('tx');

    setState((prev) => {
      const expenseTx: Transaction = {
        id: txId,
        type: 'expense',
        amount: payload.amount,
        category: 'Bayar Utang',
        walletId: payload.walletId,
        date: today,
        note: `Bayar / cicil utang ke ${payload.debt.lenderName}`,
        relatedDebtId: payload.debt.id,
        createdAt: nowIso,
      };

      const updatedDebts = prev.debts.map((d) => {
        if (d.id !== payload.debt.id) return d;
        const nextRemaining = Math.max(0, d.remainingAmount - payload.amount);
        return {
          ...d,
          remainingAmount: nextRemaining,
          status: nextRemaining === 0 ? ('paid' as const) : ('unpaid' as const),
          payments: [
            ...d.payments,
            {
              id: generateId('dp'),
              amount: payload.amount,
              date: today,
              walletId: payload.walletId,
              transactionId: txId,
            },
          ],
        };
      });

      return {
        ...prev,
        transactions: [expenseTx, ...prev.transactions],
        debts: updatedDebts,
      };
    });
  };

  // Handlers Retensi, Backup & Reset
  const handleManualPrune = (): number => {
    const result = runFiveYearRetentionPrune(state);
    setState(result.state);
    return result.prunedCount;
  };

  const handleImportState = (imported: AppState) => {
    const pruned = runFiveYearRetentionPrune(imported);
    setState(pruned.state);
  };

  const handleResetAllData = () => {
    clearPersistedState();
    setState(createEmptyState(state.theme));
  };

  return (
    <div className="min-h-screen bg-alabaster dark:bg-obsidian text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <WebPreviewBanner />
      <Header theme={state.theme} onToggleTheme={handleToggleTheme} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-28">
        {activeTab === 'beranda' && (
          <BerandaPage
            wallets={state.wallets}
            balances={balances}
            transactions={state.transactions}
            bills={state.bills}
            billPayments={state.billPayments}
            debts={state.debts}
            onPayBill={(bill) => setPayingBill(bill)}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'wajib' && (
          <WajibPage
            bills={state.bills}
            billPayments={state.billPayments}
            wallets={state.wallets}
            reminderStatus={reminderStatus}
            onAddBill={() => {
              setEditingBill(null);
              setBillFormOpen(true);
            }}
            onEditBill={(bill) => {
              setEditingBill(bill);
              setBillFormOpen(true);
            }}
            onDeleteBill={handleDeleteBill}
            onPayBill={(bill) => setPayingBill(bill)}
            onUndoBillPayment={handleUndoBillPayment}
          />
        )}

        {activeTab === 'dompet' && (
          <DompetPage
            wallets={state.wallets}
            balances={balances}
            debts={state.debts}
            onAddWallet={() => {
              setEditingWallet(null);
              setWalletFormOpen(true);
            }}
            onEditWallet={(wallet) => {
              setEditingWallet(wallet);
              setWalletFormOpen(true);
            }}
            onDeleteWallet={handleDeleteWallet}
            onSelectWalletHistory={(wallet) => setHistoryWalletId(wallet.id)}
            onAddDebt={() => {
              setEditingDebt(null);
              setDebtFormOpen(true);
            }}
            onEditDebt={(debt) => {
              setEditingDebt(debt);
              setDebtFormOpen(true);
            }}
            onDeleteDebt={handleDeleteDebt}
            onPayDebt={(debt) => setPayingDebt(debt)}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashflowPage
            transactions={state.transactions}
            wallets={state.wallets}
            debts={state.debts}
            theme={state.theme}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'setelan' && (
          <SetelanPage
            state={state}
            reminderStatus={reminderStatus}
            onToggleTheme={handleSetTheme}
            onManualPrune={handleManualPrune}
            onResyncReminders={refreshReminders}
            onImportState={handleImportState}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAdd={() => setQuickTxOpen(true)}
        unpaidBillsCount={unpaidBillsCount}
      />

      {/* Modals */}
      <QuickTransactionModal
        open={quickTxOpen}
        onClose={() => setQuickTxOpen(false)}
        wallets={state.wallets}
        balances={balances}
        onSubmit={handleAddTransaction}
      />

      <PayBillModal
        bill={payingBill}
        wallets={state.wallets}
        balances={balances}
        onClose={() => setPayingBill(null)}
        onConfirm={handleConfirmPayBill}
      />

      <BillFormModal
        open={billFormOpen}
        editingBill={editingBill}
        onClose={() => {
          setBillFormOpen(false);
          setEditingBill(null);
        }}
        onSave={handleSaveBill}
      />

      <WalletFormModal
        open={walletFormOpen}
        editingWallet={editingWallet}
        onClose={() => {
          setWalletFormOpen(false);
          setEditingWallet(null);
        }}
        onSave={handleSaveWallet}
      />

      <WalletHistoryModal
        wallet={historyWallet}
        balance={historyWallet ? balances[historyWallet.id] ?? 0 : 0}
        wallets={state.wallets}
        transactions={state.transactions}
        onClose={() => setHistoryWalletId(null)}
        onDeleteTransaction={handleDeleteTransaction}
      />

      <DebtFormModal
        open={debtFormOpen}
        editingDebt={editingDebt}
        onClose={() => {
          setDebtFormOpen(false);
          setEditingDebt(null);
        }}
        onSave={handleSaveDebt}
      />

      <PayDebtModal
        debt={payingDebt}
        wallets={state.wallets}
        balances={balances}
        onClose={() => setPayingDebt(null)}
        onConfirm={handleConfirmPayDebt}
      />
    </div>
  );
}

export default App;
