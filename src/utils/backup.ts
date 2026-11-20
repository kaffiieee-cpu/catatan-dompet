import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { AppState } from '../types/finance';
import { getTodayIso } from './format';
import { CURRENT_SCHEMA_VERSION, isNativeApp } from './platform';

export async function exportBackupJson(state: AppState): Promise<{
  success: boolean;
  filename: string;
  error?: string;
}> {
  const filename = `catatan-dompet-backup-${getTodayIso()}.json`;
  const payload = JSON.stringify(
    {
      ...state,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );

  if (isNativeApp()) {
    try {
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: payload,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: 'Backup Catatan Dompet',
        text: `File cadangan data Catatan Dompet (${filename})`,
        url: writeResult.uri,
        dialogTitle: 'Simpan atau Bagikan Backup Catatan Dompet',
      });

      return { success: true, filename };
    } catch (err) {
      return {
        success: false,
        filename,
        error:
          err instanceof Error
            ? err.message
            : 'Gagal mengekspor file backup ke perangkat.',
      };
    }
  }

  try {
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, filename };
  } catch {
    return {
      success: false,
      filename,
      error: 'Gagal mengunduh file backup.',
    };
  }
}

export function validateBackupPayload(
  rawText: string,
): { valid: true; data: AppState } | { valid: false; error: string } {
  try {
    const parsed = JSON.parse(rawText) as Partial<AppState>;
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'Format file JSON tidak valid.' };
    }
    if (!Array.isArray(parsed.wallets)) {
      return { valid: false, error: 'Data dompet tidak ditemukan di file backup.' };
    }
    if (!Array.isArray(parsed.transactions)) {
      return { valid: false, error: 'Data transaksi tidak ditemukan di file backup.' };
    }
    if (!Array.isArray(parsed.bills)) {
      return { valid: false, error: 'Data tagihan wajib tidak ditemukan di file backup.' };
    }
    if (!Array.isArray(parsed.billPayments)) {
      return { valid: false, error: 'Data riwayat pembayaran tagihan tidak ditemukan.' };
    }
    if (!Array.isArray(parsed.debts)) {
      return { valid: false, error: 'Data catatan utang tidak ditemukan di file backup.' };
    }

    for (const w of parsed.wallets) {
      if (!w || typeof w.id !== 'string' || typeof w.name !== 'string') {
        return { valid: false, error: 'Struktur data dompet rusak atau tidak lengkap.' };
      }
    }

    const validated: AppState = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      wallets: parsed.wallets.map((w) => ({
        ...w,
        initialBalance: Number(w.initialBalance) || 0,
        historicalAdjustment: Number(w.historicalAdjustment) || 0,
      })),
      transactions: parsed.transactions.map((t) => ({
        ...t,
        amount: Math.max(0, Number(t.amount) || 0),
      })),
      bills: parsed.bills.map((b) => ({
        ...b,
        amount: Math.max(0, Number(b.amount) || 0),
        dueDay: Math.min(31, Math.max(1, Number(b.dueDay) || 1)),
      })),
      billPayments: parsed.billPayments,
      debts: parsed.debts.map((d) => ({
        ...d,
        initialAmount: Math.max(0, Number(d.initialAmount) || 0),
        remainingAmount: Math.max(0, Number(d.remainingAmount) || 0),
        payments: Array.isArray(d.payments) ? d.payments : [],
      })),
      lastPrunedAt: typeof parsed.lastPrunedAt === 'string' ? parsed.lastPrunedAt : null,
      lastPrunedCount: typeof parsed.lastPrunedCount === 'number' ? parsed.lastPrunedCount : 0,
    };

    return { valid: true, data: validated };
  } catch {
    return {
      valid: false,
      error: 'File tidak dapat dibaca. Pastikan file adalah backup .json Catatan Dompet.',
    };
  }
}
