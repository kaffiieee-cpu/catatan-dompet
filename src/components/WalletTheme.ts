import { WalletAccent, WalletType } from '../types/finance';

export const WALLET_ACCENT_STYLES: Record<
  WalletAccent,
  {
    label: string;
    cardBg: string;
    dot: string;
    badgeBg: string;
    pattern: string;
  }
> = {
  emerald: {
    label: 'Zamrud',
    cardBg: 'from-emerald-600 via-emerald-700 to-teal-800 text-white',
    dot: 'bg-emerald-500',
    badgeBg: 'bg-white/15 text-emerald-50',
    pattern: 'wallet-pattern-dots',
  },
  blue: {
    label: 'Biru Samudra',
    cardBg: 'from-blue-600 via-blue-700 to-indigo-800 text-white',
    dot: 'bg-blue-500',
    badgeBg: 'bg-white/15 text-blue-50',
    pattern: 'wallet-pattern-grid',
  },
  amber: {
    label: 'Emas Amber',
    cardBg: 'from-amber-500 via-orange-600 to-amber-800 text-white',
    dot: 'bg-amber-500',
    badgeBg: 'bg-white/20 text-amber-50',
    pattern: 'wallet-pattern-dots',
  },
  violet: {
    label: 'Ungu Aset',
    cardBg: 'from-violet-600 via-purple-700 to-indigo-900 text-white',
    dot: 'bg-violet-500',
    badgeBg: 'bg-white/15 text-violet-50',
    pattern: 'wallet-pattern-grid',
  },
  rose: {
    label: 'Koral Merah',
    cardBg: 'from-rose-600 via-rose-700 to-pink-900 text-white',
    dot: 'bg-rose-500',
    badgeBg: 'bg-white/15 text-rose-50',
    pattern: 'wallet-pattern-dots',
  },
  slate: {
    label: 'Grafit',
    cardBg: 'from-slate-700 via-slate-800 to-slate-900 text-white',
    dot: 'bg-slate-600',
    badgeBg: 'bg-white/15 text-slate-100',
    pattern: 'wallet-pattern-grid',
  },
};

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  cash: 'Cash / Tunai',
  bank: 'Bank & E-Wallet',
  investment: 'Buku Investasi & Trading',
};
