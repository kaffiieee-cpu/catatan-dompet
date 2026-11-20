import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AppState, AppTheme } from '../types/finance';

export const STORAGE_KEY = 'catatan_dompet_state_v1';
export const CURRENT_SCHEMA_VERSION = 1;

export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function loadPersistedState(): AppState | null {
  if (!isNativeApp()) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.wallets) ||
      !Array.isArray(parsed.transactions) ||
      !Array.isArray(parsed.bills) ||
      !Array.isArray(parsed.billPayments) ||
      !Array.isArray(parsed.debts)
    ) {
      return null;
    }
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      wallets: parsed.wallets,
      transactions: parsed.transactions,
      bills: parsed.bills,
      billPayments: parsed.billPayments,
      debts: parsed.debts,
      lastPrunedAt: typeof parsed.lastPrunedAt === 'string' ? parsed.lastPrunedAt : null,
      lastPrunedCount: typeof parsed.lastPrunedCount === 'number' ? parsed.lastPrunedCount : 0,
    };
  } catch {
    return null;
  }
}

export function savePersistedState(state: AppState): boolean {
  if (!isNativeApp()) {
    return false;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearPersistedState(): void {
  if (!isNativeApp()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Abaikan error penyimpanan
  }
}

export async function syncNativeStatusBar(theme: AppTheme): Promise<void> {
  if (!isNativeApp()) return;
  try {
    await StatusBar.setStyle({
      style: theme === 'dark' ? Style.Dark : Style.Light,
    });
    await StatusBar.setBackgroundColor({
      color: theme === 'dark' ? '#0C0E12' : '#F6F5F0',
    });
  } catch {
    // Aman diabaikan pada perangkat yang tidak mendukung
  }
}
