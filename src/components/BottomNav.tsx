import React from 'react';
import {
  BarChart3,
  CalendarClock,
  Home,
  Plus,
  Settings,
  Wallet,
} from 'lucide-react';
import { AppTab } from '../types/finance';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenQuickAdd: () => void;
  unpaidBillsCount: number;
}

const NAV_ITEMS: Array<{ id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'wajib', label: 'Wajib', icon: CalendarClock },
  { id: 'dompet', label: 'Dompet', icon: Wallet },
  { id: 'cashflow', label: 'Cashflow', icon: BarChart3 },
  { id: 'setelan', label: 'Setelan', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickAdd,
  unpaidBillsCount,
}) => {
  return (
    <>
      <button
        type="button"
        onClick={onOpenQuickAdd}
        aria-label="Catat Transaksi Cepat"
        className="fixed bottom-20 right-4 sm:right-[max(1rem,calc(50%-20rem))] z-40 w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center transition"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-charcoal/95 backdrop-blur-md border-t border-sandline dark:border-slateborder safe-pb">
        <div className="max-w-2xl mx-auto px-2 pt-1.5 grid grid-cols-5 gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'}`} />
                  {item.id === 'wajib' && unpaidBillsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                      {unpaidBillsCount}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 w-6 h-0.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
