import React from 'react';
import { Moon, Sun, Wallet2 } from 'lucide-react';
import { AppTheme } from '../types/finance';
import { formatMonthYearId, getCurrentMonthKey } from '../utils/format';

interface HeaderProps {
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  const monthLabel = formatMonthYearId(getCurrentMonthKey());

  return (
    <header className="sticky top-0 z-30 bg-alabaster/90 dark:bg-obsidian/90 backdrop-blur-md border-b border-sandline dark:border-slateborder safe-pt">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-sm">
            <Wallet2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Catatan Dompet
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {monthLabel} • Offline
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Aktifkan Tema Terang' : 'Aktifkan Tema Gelap'}
          className="inline-flex items-center gap-1.5 rounded-xl border border-sandline dark:border-slateborder bg-white dark:bg-charcoal px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Gelap</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
